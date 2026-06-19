/**
 * @file DetailPage.jsx
 * @description
 *   Single MAUDE event record detail view.
 *   Sections match official FDA MAUDE detail page structure and field labels.
 *   Sections: Device Information, Report Information, Narrative,
 *             Product Problems, Patient Information.
 */

import Breadcrumb from '../components/Detail/Breadcrumb.jsx';
import DetailSection from '../components/Detail/DetailSection.jsx';
import { useApp } from '../../context/AppContext.jsx';

/** Maps sequence_number_outcome codes → human-readable labels. */
const OUTCOME_CODES = {
  '1': 'Death',
  '2': 'Life-Threatening',
  '3': 'Hospitalization – Initial or Prolonged',
  '4': 'Disability',
  '5': 'Congenital Anomaly / Birth Defect',
  '6': 'Required Intervention to Prevent Permanent Impairment',
  '7': 'Other Serious (Clinically Important) Event',
  '8': 'No Outcomes Indicated',
};

/** Maps sequence_number_treatment codes → human-readable labels. */
const TREATMENT_CODES = {
  '0': 'No Information',
  '1': 'Drug Therapy',
  '2': 'Surgical Intervention',
  '3': 'Concomitant Medical Product',
  '4': 'Rehabilitative Therapy',
  '5': 'Other',
};

/** Format Y: Yes, N: No flag values. Returns '' when absent (DetailSection filters it out). */
function flagLabel(val) {
  if (val === undefined || val === null || val === '') return '';
  if (val === 'Y' || val === 'y') return 'Yes';
  if (val === 'N' || val === 'n') return 'No';
  return val;
}

function decodeOutcomes(arr) {
  if (!arr?.length) return '';
  return arr.map(c => OUTCOME_CODES[String(c)] ?? c).join('; ');
}

function decodeTreatments(arr) {
  if (!arr?.length) return '';
  return arr.map(c => TREATMENT_CODES[String(c)] ?? c).join('; ');
}

export default function DetailPage({ params }) {
  const { navigate } = useApp();
  const record = params?.record;

  if (!record) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 'calc(var(--sp) * 8)', color: 'var(--color-muted)' }}>
        <p>No record selected.</p>
        <button className="btn-secondary" style={{ marginTop: 'calc(var(--sp) * 2)' }} onClick={() => navigate('result')}>
          Back to Results
        </button>
      </div>
    );
  }

  const device  = record.device?.[0] ?? {};
  const mdrTexts = buildMdrTexts(record.mdr_text ?? []);
  const patient = record.patient ?? [];

  const crumbs = [
    { label: 'Search Results', onClick: () => navigate('result') },
    { label: 'Report Detail' },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <Breadcrumb items={crumbs} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'calc(var(--sp) * 3)' }}>
        <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 700, color: 'var(--color-primary)' }}>
          Report Detail
        </h1>
        <div style={{ display: 'flex', gap: 'calc(var(--sp) * 1.5)' }}>
          <button className="btn-secondary" onClick={() => navigate('result')}>← Back</button>
          <button className="btn-secondary" onClick={() => navigate('search')}>New Search</button>
        </div>
      </div>

      {/* ── Device Information ──────────────────────────────────────────── */}
      <DetailSection title="Device Information" fields={[
        { label: 'Brand Name',                   value: device.brand_name },
        { label: 'Common Device Name',           value: device.generic_name },
        { label: 'Product Code',                 value: device.device_report_product_code },
        { label: 'Device Sequence Number',       value: device.device_sequence_number },
        { label: 'Manufacturer Name',            value: device.manufacturer_d_name },
        { label: 'Manufacturer Address',         value: joinAddress(device) },
        { label: 'Model Number',                 value: device.model_number },
        { label: 'Catalog Number',               value: device.catalog_number },
        { label: 'Lot Number',                   value: device.lot_number },
        { label: 'UDI-Device Identifier',        value: device.udi_di },
        { label: 'UDI-Public',                   value: device.udi_public },
        { label: 'Device Operator',              value: device.device_operator },
        { label: 'Device Availability',          value: device.device_availability },
        { label: 'Device Evaluated by Manufacturer', value: device.device_evaluated_by_manufacturer },
      ]} />

      {/* ── Report Information ──────────────────────────────────────────── */}
      <DetailSection title="Report Information" fields={[
        { label: 'MDR Report Key',               value: record.mdr_report_key },
        { label: 'Report Number',                value: record.report_number },
        { label: 'Type of Reportable Event',     value: record.event_type },
        { label: 'Adverse Event Flag',           value: flagLabel(record.adverse_event_flag) },
        { label: 'Product Problem Flag',         value: flagLabel(record.product_problem_flag) },
        { label: 'Combination Product Flag',     value: flagLabel(record.combination_product_flag) },
        { label: 'Single Use Flag',              value: flagLabel(record.single_use_flag) },
        { label: 'Reprocessed and Reused Flag',  value: flagLabel(record.reprocessed_and_reused_flag) },
        { label: 'Date Received',                value: record.date_received },
        { label: 'Date of Event',                value: record.date_of_event },
        { label: 'Date of Report',               value: record.date_report },
        { label: 'Date Manufacturer Received',   value: record.date_manufacturer_received },
        { label: 'Reporter Occupation',          value: record.reporter_occupation_code },
        { label: 'Report Source',                value: record.report_source_code },
        { label: 'Type of Report',               value: Array.isArray(record.type_of_report) ? record.type_of_report.join('; ') : record.type_of_report },
      ]} />

      {/* ── Event Description + Manufacturer Narrative (merged) ────────── */}
      {mdrTexts.length > 0 && (
        <section style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'calc(var(--sp) * 3)', marginBottom: 'calc(var(--sp) * 2)' }}>
          <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 600, marginBottom: 'calc(var(--sp) * 2)' }}>Narrative</h3>
          <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--color-text)' }}>
            {mdrTexts.map(t => t.text).join('\n\n')}
          </p>
        </section>
      )}

      {/* ── Product Problems ────────────────────────────────────────────── */}
      {(record.product_problems ?? []).length > 0 && (
        <DetailSection title="Product Problems" fields={[
          { label: 'Problem(s)', value: record.product_problems.join('; ') },
        ]} />
      )}

      {/* ── Patient Information ─────────────────────────────────────────── */}
      {patient.length > 0 && patient.map((pt, idx) => (
        <DetailSection
          key={idx}
          title={patient.length > 1 ? `Patient Information (${idx + 1})` : 'Patient Information'}
          fields={[
            { label: 'Patient Sequence Number', value: pt.patient_sequence_number },
            { label: 'Date Received',           value: pt.date_received },
            { label: 'Patient Outcome(s)',       value: decodeOutcomes(pt.sequence_number_outcome) },
            { label: 'Treatment(s)',             value: decodeTreatments(pt.sequence_number_treatment) },
          ]}
        />
      ))}
    </div>
  );
}

/**
 * Returns narrative text entries in display order (DA before DN/N).
 * DA = event/problem description; DN/N = manufacturer narrative.
 * @param {Array<{ text_type_code: string, text: string }>} entries
 * @returns {Array<{ text: string }>}
 */
function buildMdrTexts(entries) {
  const ORDER = ['DA', 'DN', 'N'];
  return [...entries]
    .sort((a, b) => {
      const ai = ORDER.indexOf(a.text_type_code);
      const bi = ORDER.indexOf(b.text_type_code);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .filter(e => e.text?.trim())
    .map(e => ({ text: e.text.trim() }));
}

/**
 * Combines manufacturer address fields into a single readable string.
 * @param {object} d - device object
 * @returns {string}
 */
function joinAddress(d) {
  const parts = [
    d.manufacturer_d_address_1,
    d.manufacturer_d_address_2,
    d.manufacturer_d_city,
    d.manufacturer_d_state,
    d.manufacturer_d_zip_code,
    d.manufacturer_d_country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '';
}
