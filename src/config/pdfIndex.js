const { createInvoice } = require("./createInvoice.js");

exports.invoiceDetails = (details)=> {
    const invoice ={shipping:{
        name:details.userId.fullName,
        address: details.addressId.houseNo + " " +details.addressId.street,
        city: details.addressId.city,
        state:details.addressId.state,
        country:details.addressId.country,
        postal_code: details.addressId.pincode
    },items:[],subtotal:0}
    for (let i of details.products){
        invoice.items.push({
            item:i.productId.title,
            description:"",
            quantity:i.quantity,
            amount : i.price
        })
        invoice.subtotal+= (i.quantity * i.price)
    }
  invoice.paid= 0,
  invoice.invoice_nr= 1234
  return invoice
};
