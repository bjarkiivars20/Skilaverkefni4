var socket = io();

//Öll html id
var fela = document.getElementById("fela");
//Takki fyrir endurstillingur, gerði hann disabled í byrjun því hann generate'ar chat
var endurstilla = document.getElementById("endurstilla"); //endurstilla.disabled = true;

var showUserForm = document.getElementById("userForm");
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var usernameForm = document.getElementById("userNameValue");
var input = document.getElementById('input');
var searchForm = document.getElementById("searchForm"); //fyrir síjuformið
var search = document.getElementById("search");
let feedback = document.getElementById("feedback");
let notendanafn = document.getElementById("notendanafnGildiText");
let randomNames = ["Mr. Nice Guy","Moss","Jen Barber","Asmongold"];


//Þetta er formið fyrir chattið
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
    $(".liItem").remove();
  }
}); 

//Þessi sér um að taka history á chattinu og sýnir allt
socket.on("chat_init", (chat_log) =>{
  for(var i = 0; i < chat_log.length; i++) {
    //býr til nýtt <li>
    var item_chat = document.createElement('li');
    
    //set hérna klasa sem ég tek svo í burtu þegar ég síja eftir nafni
    item_chat.classList.add("chatItem");

    //Tekur chat_log frá server og mongo, og setur það sem li value
    item_chat.textContent = chat_log[i].user + ": " + chat_log[i].message;
    messages.appendChild(item_chat);
    
    window.scrollTo(0, document.body.scrollHeight);
  }
});

//Tekur skilaboð frá servernum og sendir það í <ul> <li>
socket.on('chat message', function(msg) {
  var item = document.createElement('li');
  
  item.textContent = msg;
  messages.appendChild(item);
 
  $(".liItem").remove();

  window.scrollTo(0, document.body.scrollHeight);
});

//Function til þess að fela chattið
function felaChat() {
   fela.style.display = "none";
}

//Function sem felur username formið og sýnir chattið
function synaChat() {
  fela.style.display = "";
  showUserForm.style.display = "none";
}

//Sendir notendanafn á serverinn og felur formið ef það hefur gengið upp
function notendanafnGildi() {
  socket.emit("new user", notendanafn, function(data){
    if(data) {
      synaChat();
    } else {
      document.getElementById("userError").innerHTML = "Þetta notendanafn er nú þegar tekið, reyndu aftur.";
      return;
    }
  });
}

//Tekur notendanöfn frá servernum og setur það í lista til að sýna currently active
socket.on("usernames", function(data){
  document.getElementById("virkirNotendur").innerHTML = "";

  var currentActive = document.getElementById("virkirNotendur");
  for(var i = 0; i < data.length; i++) {
    currentActive.innerHTML += data[i] +"<br/>"
  }
});

//Hérna tek ég frá socketinu notendanafn
//Bý til li item sem fer á ul þar sem chattið er
//Set klassa á list itemið og fjarlægi það ef það er til
socket.on("typing", function(data){
  if(data){
    if($(".liItem")[0]) {
      setTimeout(function() {
        $(".liItem").remove();//Þetta er Jquery skipun, auðveld leið til að fjarlægja klassa
      },3000);       
    }else {
      let item = document.createElement("li");

      item.textContent = data + " is typing..";
      item.classList.add("liItem");
      messages.appendChild(item);
    }     
  }
});

//Sendir á serverinn þegar það er verið að skrifa fyrir "user is typing.."
input.addEventListener("keydown", function() {
  socket.emit("typing", notendanafn);

  setTimeout(function(){
     $(".liItem").remove()
  },3000);
});

//Fel chattið þegar glugginn er opnaður
window.onload = felaChat;

//Þegar það er verið að velja notendanafn þá keyrir þetta eftir að það er ýtt á enter eða submit á takkanum
usernameForm.addEventListener("submit", (e) => {
  e.preventDefault(); //Kemur í veg fyrir refresh

  if(notendanafn.value) {
    notendanafn = document.getElementById("notendanafnGildiText").value;
  } else {
    let newRandom = Math.floor(Math.random() * randomNames.length);

    //Ákvað að ég myndi frekar fjarlægja nafn úr listanum og ef það eru öll random nöfnin tekin, þá er bara ekkert eftir
    notendanafn = randomNames[newRandom];
    randomNames.splice(newRandom);
  }
  notendanafnGildi();
});



//fer afstað þegar formið er submittað fyrir síju
searchForm.addEventListener("submit", (e) => {
  $(".chatItem").remove();// Öll li í chattinu eru merkt með chatItem klasanum, þetta fjarlægjir hann, en þetta er jquery kóði

  var searchValue = "";

  e.preventDefault(); //Kemur í veg fyrir refresh
  
  if(search.value != null) { //Ef input fieldinn er ekki tómur þá skilar hann gildi
    searchValue = search.value;//Tek value úr input field
  } else { //annars skilar hann núll til þess að koma í veg fyrir uncaught error
    searchValue = null;
  }
  console.log(searchValue);
  //Geri það þannig að takkinn fyrir endurstillingu virki bara eftir að þetta form er submittað
  endurstilla.disabled = false;

  socket.emit("searching", searchValue); // sendir á serverinn value úr texta fieldinu
 
});

  //tek síðan gögn frá mongo og vinn með það
  socket.on("searching", (result) => { //result er niðurstaðan sem mongo skilar
    for(let i = 0; i < result.length; i++) { //Því mongo skilar array, þá tek ég lengdina og læt for lykkju keyra sem skilar öllum niðurstöðum
        var item_chat = document.createElement('li'); //Bý til <li>
        item_chat.classList.add("chatItem");
        item_chat.textContent = result[i].user + ": " + result[i].message; //Gef li value sem er tekið frá mongo
        messages.appendChild(item_chat); //Set li sem child af ul messages
        window.scrollTo(0, document.body.scrollHeight); //Lætur skilaboðin scrolla upp
    }
  }); 

//Þegar það er ýtt á endurstilla takka hjá notenda síju
endurstilla.addEventListener("click", () => {

  //Kem í veg fyrir það að notandinn geti ýtt oft á endurstill og fengið sama chat aftur og aftur
  //endurstilla.disabled = true;
  if($(".chatItem")) {
    console.log("hello");
    $(".chatItem").remove();
  }
  //// Öll li í chattinu eru merkt með chatItem klasanum, þetta fjarlægjir hann, en þetta er jquery kóði

  //Endur geri kóðann áðan, virkar það?
  socket.emit("redo");
});

socket.on("redo", (result) => {
  for(let i = 0; i < result.length; i++) {
    //býr til nýtt <li>
    var item_chat = document.createElement('li');
    
    //set hérna klasa sem ég tek svo í burtu þegar ég síja eftir nafni
    item_chat.classList.add("chatItem");

    //Tekur chat_log frá server og mongo, og setur það sem li value
    item_chat.textContent = result[i].user + ": " + result[i].message;
    messages.appendChild(item_chat);
    
    window.scrollTo(0, document.body.scrollHeight);
  }

});