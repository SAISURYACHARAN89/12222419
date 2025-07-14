const express = require('express');

const Url = {
    url : {
        type : "String",
        required : true,
    },
    validity : {
        type : "Number",
        default : 30, 
    },
    shortcode : {
        type : "String",
    }
}

module.exports = Url;