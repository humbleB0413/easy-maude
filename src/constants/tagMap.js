/**
 * @file tagMap.js
 * @description
 *   Mapping from simplified user-facing tag names to OpenFDA field paths.
 *   Add new tags here; no other code change needed.
 */

const tagMap = {
  brand:        'device.brand_name',
  generic:      'device.generic_name',
  manufacturer: 'device.manufacturer_d_name',
  model:        'device.model_number',
  code:         'device.device_report_product_code',
  udi:          'device.udi_di',
  event:        'event_type',
  date:         'date_received',
  event_date:   'date_of_event',
  report:       'mdr_report_key',
  reporter:     'reporter_occupation_code',
  text:         'mdr_text.text',
  problem:      'product_problems',
};

export default tagMap;

export const TAG_LABELS = {
  brand:        'Brand Name',
  generic:      'Generic Name',
  manufacturer: 'Manufacturer',
  model:        'Model Number',
  code:         'Product Code',
  udi:          'UDI-DI',
  event:        'Event Type',
  date:         'Date Received',
  event_date:   'Date of Event',
  report:       'MDR Report Key',
  reporter:     'Reporter Occupation',
  text:         'Event Description',
  problem:      'Product Problems',
};
