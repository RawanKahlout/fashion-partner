const { collection } = require('forest-express-sequelize');

// This file allows you to add to your Forest UI:
// - Smart actions: https://docs.forestadmin.com/documentation/reference-guide/actions/create-and-manage-smart-actions
// - Smart fields: https://docs.forestadmin.com/documentation/reference-guide/fields/create-and-manage-smart-fields
// - Smart relationships: https://docs.forestadmin.com/documentation/reference-guide/relationships/create-a-smart-relationship
// - Smart segments: https://docs.forestadmin.com/documentation/reference-guide/segments/smart-segments


collection('product', {
  actions: [
    {
    name: 'Import Quantities',
    endpoint: '/forest/product/actions/import-quantities',
    type: 'global',
    fields: [{
      field: 'CSV file',
      description: 'A comma separated values file stores tabular data (numbers and text) in plain text',
      type: 'File',
      isRequired: true
    }, {
      field: 'Type',
      description: 'Specify the product type to import',
      type: 'Enum',
      enums: ['Apparel', 'Sneakers'],
      isRequired: true
    }]
  },
  {
    name: "Activate",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    endpoint: '/forest/product/actions/activate',
    fields: [
    ]
  },
  {
    name: "Inactive",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    endpoint: '/forest/product/actions/inactive',
    fields: [
    ]
  },
  {
    name: "Enable ",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    endpoint: '/forest/product/actions/enable',
    fields: [
    ]
  },
  {
    name: "Disable ",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    endpoint: '/forest/product/actions/disable',
    fields: [
    ]
  },
  {
    name: "Add Discount Price",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    fields: [
      {
        field: "discount_percentage",
        type: "Number"
      }
    ]
  },
  {
    name: "Add Sale Price",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    fields: [
      {
        field: "salePrice",
        type: "Number"
      }
    ]
  },
  {
    name: "Change Price",
    type: "bulk",//Single:can be trigger only on a single record;Bulk:default, Global:without selection like export/import csv
    fields: [
      {
        field: "price",
        type: "Number"
      }
    ]
  }
],
  fields:[
    /*{
      field: 'imageList',
      type: ['String'],
      get: (record) => record.imageList.split(',')
    }*/
  {
      field: 'imageList',
      type: 'String',
      get: (record) => {
        const imagesArray = record.imageList.split(',')
        let htmlList = ""
        let carouselItems = ""
        imagesArray.forEach((object, index) => {
          let statusClass = index === 0 ? "active" : ""
          htmlList += `<li data-target="#imageCarousel" data-slide-to="${index}" class="${statusClass}"></li>`
          carouselItems += `<div class="carousel-item ${statusClass}">
                <img class="d-block w-100" src="https://cdn.nejree.com/media/catalog/product${object}" alt="slide ${index}">
              </div>`
        })
        return `
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
          <div id="imageCarousel" class="carousel slide" style="width:300px" data-ride="carousel">
            <ol class="carousel-indicators" style="color:white">
            <li>
              ${htmlList}
            <li>
            </ol>
            <div class="carousel-inner">
              ${carouselItems}
            </div>
            <a  class="carousel-control-prev" href="#imageCarousel" role="button" data-slide="prev" style="background:black;border-radius:50%;margin-top:50%;height:34px;width:34px">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#imageCarousel" role="button" data-slide="next" style="background:black;border-radius:50%;margin-top:50%;height:34px;width:34px">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>

        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
        `
      }
    }
],
  searchFields: ['createdBy']
});
