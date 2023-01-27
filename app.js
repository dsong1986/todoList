//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
mongoose.set('strictQuery', true);
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// MongoDB DB
// const uri = "mongodb://localhost:27017/todoListDB";
const uri = "mongodb+srv://ststns:Dong1986@cluster0.8jcmsc0.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri);
const itemsSchema =({
  text:String
});

const Item = mongoose.model("Item", itemsSchema);

const buyFood = new Item({text:"Buy Food"});
const cookFood = new Item({text:"Cook Food"});
const eatFood = new Item({text:"Eat Food"});
const defaultItems = [buyFood, cookFood, eatFood];


const listSchema = ({
  name: String,
  items:[itemsSchema]
});
const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req,res){
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err,listName){
    if(!err){

      if(!listName){
      const newList = new List({
        name: customListName,
        items: defaultItems
      });
      newList.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle: customListName, newListItems: listName.items});
    }
  }
  });
});

app.get("/", function(req, res) {
  Item.find({}, function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err) console.log(err);
        else console.log("Successfully insert 3 items");
      });
      res.redirect("/");
    }else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const title = req.body.list;

  const newItem = new Item({text:item});

  if(title === "Today"){
      newItem.save();
      res.redirect("/");
  }else{
    List.findOne({name:title}, function(err, arr){
      arr.items.push(newItem);
      arr.save();
      res.redirect("/"+title);
    })
  }

});

app.post("/delete", function(req, res){
    const idToDelete = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
      Item.findByIdAndRemove({_id:idToDelete},function(err){
        if(err)console.log(err);
      });
      res.redirect("/");
    }else {
        List.findOneAndUpdate({name:listName},{$pull: {items: {_id: idToDelete }}}, function(err,foundList){
          if(!err){
                res.redirect("/"+listName);
          }
        });

    }

});


//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
