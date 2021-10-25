const { collection } = require('forest-express-sequelize');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments

collection('productItem', {
  actions: [  {

    endpoint: '/forest/productItem/actions/updateQuantity',
      name: "Update Quantity",
      type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      fields: [
        {
          field: "quantity",
          type: "Number"
        }
      ]
    },{
      name: "Enable ",
      type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      endpoint: '/forest/productItem/actions/enable',
      fields: [
      ]
    },
    {
      name: "Disable ",
      type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      endpoint: '/forest/productItem/actions/disable',
      fields: [
      ]
    },
    {
      name: "Activate",
      type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      endpoint: '/forest/productItem/actions/activate',
      fields: [
      ]
    },
    {
      name: "Inactive",
      type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
      endpoint: '/forest/productItem/actions/inactive',
      fields: [
      ]
    }
  ],
  fields: [],
  segments: [],
});
