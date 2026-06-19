/**
 * @file AppContext.jsx
 * @description
 *   App-level React context. Manages: page navigation, search lifecycle state,
 *   settings panel visibility. Exposes useApp() hook.
 */

import { createContext, useContext, useReducer, useRef } from 'react';
import SearchController from '../controllers/SearchController.js';
import resultModel from '../models/ResultModel.js';
import historyModel from '../models/HistoryModel.js';

const AppContext = createContext(null);

const initialState = {
  currentPage:  'search',   // 'search' | 'progress' | 'result' | 'detail' | 'history'
  pageParams:   {},
  searchQuery:  '',
  searchStatus: 'idle',     // 'idle' | 'searching' | 'complete' | 'error' | 'cancelled'
  progress:     { received: 0, total: 0, windowReceived: null, windowTotal: null, windowDateRange: null },
  results:      [],
  searchId:     null,
  error:        null,
  showSettings: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page, pageParams: action.params ?? {} };
    case 'SEARCH_START':
      return {
        ...state,
        searchStatus: 'searching',
        searchQuery:  action.query,
        progress:     { received: 0, total: 0, windowReceived: null, windowTotal: null, windowDateRange: null },
        results:      [],
        error:        null,
      };
    case 'SEARCH_PROGRESS':
      return {
        ...state,
        progress: {
          received:       action.received       ?? 0,
          total:          action.total          ?? 0,
          windowReceived: action.windowReceived ?? null,
          windowTotal:    action.windowTotal    ?? null,
          windowDateRange: action.windowDateRange ?? null,
        },
      };
    case 'SEARCH_COMPLETE':
      return {
        ...state,
        searchStatus: 'complete',
        results:      action.results,
        searchId:     action.searchId,
        // query is optional — omit when searching normally (already set by SEARCH_START)
        ...(action.query != null ? { searchQuery: action.query } : {}),
      };
    case 'SEARCH_ERROR':
      return { ...state, searchStatus: 'error', error: action.error };
    case 'SEARCH_CANCELLED':
      return { ...state, searchStatus: 'cancelled', results: [], searchId: null };
    case 'TOGGLE_SETTINGS':
      return { ...state, showSettings: !state.showSettings };
    case 'CLOSE_SETTINGS':
      return { ...state, showSettings: false };
    default:
      return state;
  }
}

/**
 * @param {{ children: React.ReactNode, settings: object }} props
 */
export function AppProvider({ children, settings }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);

  const navigate = (page, params = {}) =>
    dispatch({ type: 'NAVIGATE', page, params });

  const startSearch = async (query) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'SEARCH_START', query });
    navigate('progress');

    try {
      const { results, searchId } = await SearchController.execute(
        query,
        settings,
        (progressInfo) => dispatch({ type: 'SEARCH_PROGRESS', ...progressInfo }),
        controller.signal,
      );

      const dataSize = await resultModel.store(searchId, query, results);
      await historyModel.addEntry(searchId, query, results.length, dataSize);

      dispatch({ type: 'SEARCH_COMPLETE', results, searchId });
      navigate('result');
    } catch (e) {
      if (e.name === 'AbortError') {
        resultModel.clearCache();
        dispatch({ type: 'SEARCH_CANCELLED' });
        navigate('search');
      } else if (e instanceof TypeError || (e.name === 'ApiError' && e.status >= 500)) {
        navigate('unavailable');
      } else {
        dispatch({ type: 'SEARCH_ERROR', error: e.message });
      }
    }
  };

  const cancelSearch = () => abortRef.current?.abort();

  const value = { state, navigate, startSearch, cancelSearch, dispatch };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * @returns {{ state: object, navigate: function, startSearch: function, cancelSearch: function, dispatch: function }}
 */
export const useApp = () => useContext(AppContext);
