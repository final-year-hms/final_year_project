const express = require("express");
const addRouter = express.Router();
const Viewdata = require('../model/Viewdata');

function router(nav){
    addRouter.get('/',function(req,res){
        res.render("addPatient",
        {
            nav,
            title:'Add Patient'
        })
    })

    addRouter.post('/store',function(req,res){
        var item = {
            name: req.body.name,
            id: req.body.id,
            details: req.body.details,
            medication: req.body.medic
        }

        var patient = Viewdata(item);
        patient.save();
        res.redirect('/request');
       
    })

    return addRouter;
}

module.exports = router;