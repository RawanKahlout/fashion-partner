const express = require('express');
const { PermissionMiddlewareCreator } = require('forest-express-sequelize');
const { order, orderItem, product, partner } = require('../models');
const PDFDocument = require("pdfkit");
const router = express.Router();
const Liana = require('forest-express-sequelize')
const { Op } = require('sequelize')
var request = require('request');
var fs = require('fs');
const permissionMiddlewareCreator = new PermissionMiddlewareCreator('order');

// This file contains the logic of every route in Forest Admin for the collection order:
// - Native routes are already generated but can be extended/overriden - Learn how to extend a route here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/extend-a-route
// - Smart action routes will need to be added as you create new Smart Actions - Learn how to create a Smart Action here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/actions/create-and-manage-smart-actions

// Create a Order
router.post('/order', permissionMiddlewareCreator.create(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#create-a-record
    next();
});

// Update a Order
router.put('/order/:recordId', permissionMiddlewareCreator.update(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#update-a-record
    next();
});

// Delete a Order
router.delete('/order/:recordId', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-record
    next();
});

// Get a list of Orders
router.get('/order', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-list-of-records
    next();
});

// Get a number of Orders
router.get('/order/count', permissionMiddlewareCreator.list(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-number-of-records
    next();
});

// Get a Order
router.get('/order/:recordId(?!count)', permissionMiddlewareCreator.details(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#get-a-record
    next();
});

// Export a list of Orders
router.get('/order.csv', permissionMiddlewareCreator.export(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#export-a-list-of-records
    next();
});

// Delete a list of Orders
router.delete('/order', permissionMiddlewareCreator.delete(), (request, response, next) => {
    // Learn what this route does here: https://docs.forestadmin.com/documentation/v/v6/reference-guide/routes/default-routes#delete-a-list-of-records
    next();
});
function generateHeader(doc) {
    doc
        .image("./public/logo.png", 50, 45, { width: 80 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Nejree.", 130, 57)
        .fontSize(10)
        .text("Nejree Sportware", 200, 65, { align: "right" })
        .text("Riyadh,SaudiArabia,As sulimaniyah", 200, 80, { align: "right" })
        .text("Tel:+96620009750", 200, 95, { align: "right" })
        .text("CR:1010715421", 200, 110, { align: "right" })
        .moveDown();
}
function generateFooter(doc) {
    doc
        .fontSize(10)
        .text(
            "Payment is due within 15 days. Thank you for your business.",
            50,
            780,
            { align: "center", width: 500 }
        );
}
function generateCustomerInformation(doc, invoice, records) {
    const shipping = invoice.shipping;
    orderDate = JSON.stringify(records[0].dataValues.orderDate);
    doc
        .fillColor("#000000")
        .text(`Order Number: ${records[0].dataValues.orderNumber}`, 50, 200)
        .text(`Order Date: ${orderDate.match("\[0-9]{4}-\[0-9]{2}-\[0-9]{2}")[0]}`, 50, 215)
        .text(`Payment Type: ${replacePaymentMethodValue(records[0].dataValues.method)}`, 450, 220)
        .text(`Shipping city: ${records[0].dataValues.city}`, 450, 200)
        .polygon([50, 300], [200, 300], [550, 300])
        .stroke()
        .fillAndStroke("#444444", "#444444")
        .moveDown();
}
function generateTableRow(response,doc, y, c1, c2, c3, c4, c5) {

    doc
        .fillColor("#000000")
        .text("Image",80,310)
        .text("Name", 180, 310)
        .text("SKU", 280, 310)
        .text("Tax", 360, 310)
        .text("Discount amount", 400, 310)
        .text("price", 500, 310)
        .polygon([50, 330], [200, 330], [550, 330])
        .stroke()
        .fontSize(10)
        .fillColor("#000000")
        .fontSize(10)
        .text(c1, 180, y)
        .text(c2, 260, y)
        .text(c3, 360, y)
        .text(c4, 430, y)
        .text(c5, 500, y);

}
function generateInvoiceTable(doc, invoice, records,response) {
    let shippingFee, usedStoreCredit, couponCode, totalDiscountAmount, grandTotal, codFee;
    records[0].dataValues.shippingFee ? shippingFee = records[0].dataValues.shippingFee : shippingFee = 0;
    records[0].dataValues.codFee ? codFee = records[0].dataValues.codFee : codFee = 0;
    records[0].dataValues.usedStoreCredit ? usedStoreCredit = records[0].dataValues.usedStoreCredit : usedStoreCredit = 0;
    records[0].dataValues.couponCode ? couponCode = records[0].dataValues.couponCode : couponCode = "";
    records[0].dataValues.totalDiscountAmount ? totalDiscountAmount = records[0].dataValues.totalDiscountAmount : totalDiscountAmount = 0;
    records[0].dataValues.grandTotal ? grandTotal = records[0].dataValues.grandTotal : totalDiscountAmount = 0;
    let i,
        invoiceTableTop = 330;
    let position;
    for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            response,
            doc,
            position,
            item.Name,
            item.Sku,
            item.tax,
            item.quantity,
            item.price,
            item.image,
        );

    }
    doc
        .fillColor("#000000")
        .polygon([50, position + 50], [200, position + 50], [550, position + 50])
        .stroke()
        .fontSize(10)
        .text(`Shipping fee: ${Math.round(shippingFee)}`, 400, position + 100)
        .text(`Cash on delivery fee: ${Math.round(codFee)}`, 400, position + 120);
    doc.text(`Store credit: ${Math.round(usedStoreCredit)}`, 400, position + 140)
    doc.text(`Coupon code: ${Math.round(couponCode)}`, 400, position + 160);
    doc.text(`Total discount amount: ${Math.round(totalDiscountAmount)}`, 400, position + 180)
    doc.text(`Total: ${Math.round(grandTotal)}`, 400, position + 200)
}
function replacePaymentMethodValue(paymentMethod) {
    let newValue;
    switch (paymentMethod) {
        case "checkoutcom_apple_pay":
            newValue = "Apple Pay";
            return newValue;
            break;
        case "free":
            newValue = "Free"
            return newValue;
            break;
        case "tamara_pay_later":
            newValue = "Tamara Pay Later"
            return newValue;
            break;
        case "checkoutcom_card_payment":
            newValue = "Checkout";
            return newValue;
            break;
        case "tamara_pay_by_instalments":
            newValue = "Tamara Pay By Instalments";
            return newValue;
            break
        default: return
    }
}
router.post('/actions/download-invoice', permissionMiddlewareCreator.smartAction(), async (req, response) => {
    const recordIds = req.body.data.attributes.ids
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename=list-download.pdf`);
    response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    const records = await order.findAll({ where: { id: recordIds } });
    const recordss = await orderItem.findAll({ where: { order_id: recordIds } });
    const productList = recordss.map((record) => {
      const records = record;
        return {
            "quantity": record.dataValues.quantity,
            "Name": record.dataValues.name,
            "tax": "15%",
            "price": record.dataValues.price,
            "Sku": record.dataValues.sku,
            "image":"https://cdn.nejree.com/media/catalog/product/cache/b3f606e0eb41fb06242e986c0c57c0ec/h/1/h13455-2021-07-07t09-1.jpg"
        }
    })
    const invoice = {
        items: productList,
    };
    response.setHeader('Content-Disposition', `attachment; filename=${records[0].dataValues.orderNumber}`);
    let doc = new PDFDocument({ margin: 50 });
    //genrateImage(doc, response);
    genrateImage2(doc);
    generateHeader(doc);
    generateCustomerInformation(doc, invoice, records);
    generateInvoiceTable(doc, invoice, records,response);
    doc.pipe(response);
    doc.end();
});

function genrateImage(doc, response){
  let url = "https://cdn.nejree.com/media/catalog/product/cache/b3f606e0eb41fb06242e986c0c57c0ec/h/1/h13455-2021-07-07t09-1.jpg";
  request({ url, encoding: null }, (error,responses,body) => {
   if (!error ) {
       var img = new Buffer(body, 'base64');
       doc.image(img,80,10,{ width: 50 });
   }
   doc.pipe(response);
   doc.end();
})
}
function genrateImage2(doc){
  let url = "https://cdn.nejree.com/media/catalog/product/cache/b3f606e0eb41fb06242e986c0c57c0ec/h/1/h13455-2021-07-07t09-1.jpg";

  request({ url, encoding: null }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        //  doc.pipe();

          var img = new Buffer(body, 'base64');
          doc.image(img, 0, 0);

        //  doc.end();
      }
  });
}
function genrateImage3(doc, response){
  let url = "https://cdn.nejree.com/media/catalog/product/cache/b3f606e0eb41fb06242e986c0c57c0ec/h/1/h13455-2021-07-07t09-1.jpg";
  request({ url, encoding: null }, (error,responses,body) => {
   if (!error ) {

       var img = new Buffer(body, 'base64');
       doc.image(img,80,70,{ width: 50 });
   }
})
}
router.post('/stats/gender-of-products', (req, res) => {
    let repartition;
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
      product.count({
        where:{genderId:138}
      }).then((totalOfunisex)=>{
        product.count(
            { where: { genderId: 136 } }
        ).then(totalOfMen => {
            menTotal = totalOfMen;
            product.count(
                { where: { genderId: 137 } }
            ).then(totalOfWomen => {
                womenTotal = totalOfWomen
                product.count(
                    { where: { genderId: 256 } }
                ).then(totalOfKids => {
                    kidsTotal = totalOfKids;
                    repartition = [{
                        key: "Men",
                        value: totalOfMen,
                    },
                    {
                        key: "Women",
                        value: totalOfWomen,
                    },
                    {
                        key: "Kids",
                        value: totalOfKids,
                    },
                    {
                      key :"Unisex",
                      value:totalOfunisex
                    }];
                    const json = new Liana.StatSerializer(
                        {
                            value: repartition
                        }
                    ).perform();
                    return res.send(json);
                })
            })
        })
      })

    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
          product.count(
              { where: { partnerIdKey: partners[0].dataValues.id, genderId: 138 } }
          ).then((totalOfunisex)=>{
            product.count(
                { where: { partnerIdKey: partners[0].dataValues.id, genderId: 136 } }
            ).then(totalOfMen => {
                menTotal = totalOfMen;
                product.count(
                    { where: { partnerIdKey: partners[0].dataValues.id, genderId: 137 } }
                ).then(totalOfWomen => {
                    womenTotal = totalOfWomen
                    product.count(
                        { where: { partnerIdKey: partners[0].dataValues.id, genderId: 256 } }
                    ).then(totalOfKids => {
                        kidsTotal = totalOfKids;
                        repartition = [{
                            key: "Men",
                            value: totalOfMen,
                        },
                        {
                            key: "Women",
                            value: totalOfWomen,
                        },
                        {
                            key: "Kids",
                            value: totalOfKids,
                        },
                        {
                          key:"Unisex",
                          value:totalOfunisex
                        }];
                        const json = new Liana.StatSerializer(
                            {
                                value: repartition
                            }
                        ).perform();
                        return res.send(json);
                    })
                })
            })
        });
          })
    }
});
let totalsales = 0, ordersNumber = 0, returnOrders = 0, returnSales = 0, netSales;
let returnedstatus = ["canceled", "tah_full_return_completed", "tah_return_completed", "tah_canceled", "sms_canceled", "PAYFORT_FORT_FAILED"];
let returnedSalesstatus = ["canceled", "tah_full_return_completed", "tah_return_completed", "tah_canceled", "sms_canceled", "PAYFORT_FORT_FAILED","tah_partial_return_completed"];
router.post('/stats/sales', (req, res) => {
    let json;
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
        order.findAll().then((orders) => {
            for (let i = 0; i < orders.length; i++) {
                totalsales = parseFloat(orders[i].dataValues.grandTotal) + totalsales;
            }
            json = new Liana.StatSerializer(
                {
                    value: totalsales
                }
            ).perform();
            return res.send(json);
        })
    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll({ where: { partnerIdKey: partners[0].dataValues.id } }).then((orders) => {
                for (let i = 0; i < orders.length; i++) {
                    totalsales = parseFloat(orders[i].dataValues.grandTotal) + totalsales;
                }
                json = new Liana.StatSerializer(
                    {
                        value: totalsales
                    }
                ).perform();
                return res.send(json);
            })
        })
    }

});
router.post('/stats/number-of-orders', (req, res) => {
    let json;
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
        order.findAll().then((orders) => {
            ordersNumber = orders.length;
            json = new Liana.StatSerializer(
                {
                    value: ordersNumber
                }
            ).perform();
            return res.send(json);
        })
    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll({ where: { partnerIdKey: partners[0].dataValues.id } }).then((orders) => {
                ordersNumber = orders.length;
                json = new Liana.StatSerializer(
                    {
                        value: ordersNumber
                    }
                ).perform();
                return res.send(json);
            })
        })
    }
});
router.post('/stats/return-orders', (req, res) => {
    let json;
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
        order.findAll(
            {
                where: { status: returnedstatus }
            }
        ).then((orders) => {
            returnOrders = orders.length
            json = new Liana.StatSerializer(
                {
                    value: returnOrders
                }
            ).perform();
            return res.send(json);
        })
    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll(
                {
                    where: { status: returnedstatus, partnerIdKey: partners[0].dataValues.id }
                }
            ).then((orders) => {
                returnOrders = orders.length
                json = new Liana.StatSerializer(
                    {
                        value: returnOrders
                    }
                ).perform();
                return res.send(json);
            })
        })
    }

});
router.post('/stats/return-sales', (req, res) => {
    let returnedSalesstatus = ["canceled", "tah_full_return_completed", "tah_return_completed", "tah_canceled", "sms_canceled", "PAYFORT_FORT_FAILED","tah_partial_return_completed"];
    let json;
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
        order.findAll(
            {
                where: { status: returnedSalesstatus }
            }
        ).then((orders) => {
            for (let i = 0; i < orders.length; i++) {
                returnSales = parseFloat(orders[i].dataValues.grandTotal) + returnSales;
            }
            json = new Liana.StatSerializer(
                {
                    value: returnSales
                }
            ).perform();
            return res.send(json);
        })
    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll(
                {
                    where: { status: returnedSalesstatus, partnerIdKey: partners[0].dataValues.id }
                }
            ).then((orders) => {
                for (let i = 0; i < orders.length; i++) {
                    returnSales = parseFloat(orders[i].dataValues.grandTotal) + returnSales;
                }
                json = new Liana.StatSerializer(
                    {
                        value: returnSales
                    }
                ).perform();
                return res.send(json);
            })
        })
    }
});
router.post('/stats/net-sales', (req, res) => {
    netSales = totalsales - returnSales
    json = new Liana.StatSerializer(
        {
            value: netSales
        }
    ).perform();
    return res.send(json);
});
router.post('/stats/net-orders', (req, res) => {
    let netOrders = ordersNumber - returnOrders;
    json = new Liana.StatSerializer({
        value: netOrders
    }).perform();
    return res.send(json);
});

function prepareChartJson(chartJson) {
    let finalChartJson = [];
    for (let k = 0; k < chartJson.value.length; k++) {
        var temp = chartJson.value[k];
        finalChartJson.push({
            value: temp,
            key: chartJson.date
        })
    }
    return finalChartJson;
}
function matchOrders(stOrder, ndOrder) {
    if (stOrder.match("\[0-9]{4}-\[0-9]{2}-\[0-9]{2}")[0] == ndOrder.match("\[0-9]{4}-\[0-9]{2}-\[0-9]{2}")[0])
        return true;
    else
        return false;
}
function claculate(result) {
    let chartJson = {
        date: [],
        value: []
    };
    for (let i = 0; i < result.length; i++) {
        if (i == 0) {
            chartJson.date[0] = JSON.stringify(result[i].dataValues.orderDate).match("-\[0-9]{2}-\[0-9]{2}")[0].substring(1);
            chartJson.value[0] = Math.round(result[i].dataValues.grandTotal);
        }
        else {
            if (matchOrders(JSON.stringify(result[i].dataValues.orderDate), JSON.stringify(result[i - 1].dataValues.orderDate))) {
                let pos = chartJson.value.length - 1;
                chartJson.value[pos] = Math.round(chartJson.value[pos]) + Math.round(result[i].dataValues.grandTotal);
            }
            else {
                chartJson.date.push(JSON.stringify(result[i].dataValues.orderDate).match("-\[0-9]{2}-\[0-9]{2}")[0].substring(1));
                chartJson.value.push(Math.round(result[i].dataValues.grandTotal));
            }
        }

    }

    return prepareChartJson(chartJson);
}
function checkPartner(req) {
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (matchedString[0] == "@nejree.com")
        return true;
    else
        return false;
}
router.get('/monthly-persales', (req, res) => {
    var date = new Date();
    var startDate = date.setDate(date.getDate() - 30)
    let email = req.user.email;
    let matchedString = email.match("@[a-zA-Z0-9_]*.[a-zA-Z0-9_]*");
    if (checkPartner(req)) {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll({
                where:
                {
                    orderDate: { [Op.gte]: startDate },
                    status: { [Op.not]: returnedSalesstatus },
                }
            }).then(result => {
                let chartArray = claculate(result);
                json = new Liana.StatSerializer({
                    value: chartArray,
                }).perform();
                return res.send(json);
            });
        });
    }
    else {
        partner.findAll({ where: { domain: matchedString } }).then(partners => {
            order.findAll({
                where:
                {
                    orderDate: { [Op.gte]: startDate },
                    status: { [Op.not]: returnedSalesstatus },
                    partnerIdKey:  partners[0].dataValues.id
                }
            }).then(result => {
                let chartArray = claculate(result);
                json = new Liana.StatSerializer({
                    value: chartArray,
                }).perform();
                return res.send(json);
            });
        });
    }

})

module.exports = router;
