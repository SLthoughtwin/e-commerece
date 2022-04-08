const res = require('express/lib/response');

exports.fields = (req) => {
  try {
    if (req.query.fields) {
      const fields = req.query.fields.split(',').filter((element) => element);
      const allfields = {};
      fields.map((i) => {
        allfields[i] = 1;
      });
      return allfields;
    } else {
      return (fields = {
        fullName:1,
        id: 1,
        role: 1,
        email: 1,
        phone: 1,
        isApproved:1

      });
    }
  } catch (error) {
    return {
      message: error.message,
      success: false,
    };
  }
};
