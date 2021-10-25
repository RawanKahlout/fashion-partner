const { collection } = require('forest-express-sequelize');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments

collection('productFile',{
  actions: [
    {
      name: 'Upload images file',
      type: 'global',
      fields: [{
        field: 'File',
        description: "Upload zip file",
        type: 'File',
        isRequired: true,
      }],
    },
    {
      name: "Update status",
      type: "single",
      endpoint: '/forest/productFile/actions/Update-status',
      fields: [
        {
          field: 'status',
          type: 'Enum',
          enums: ['Pending Verification','Modification Required','Upload Approved','Uploaded','Live Approved','Live'],
          isRequired: true
        }
      ]
    },
    {
      name: "Download products file ",
      type: "single",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      download: true,
      fields: [
      ]
    },
    {
    name: 'Upload products file',
    type: 'global',
    fields: [{
      field: 'file',
      type: 'String',
      widget: 'file picker',
    }]
  }],
  fields: [],
  segments: [],
  searchFields: ['createdBy'],
});
