  var socket = io();
      
      var messages = document.getElementById('messages');
      var form = document.getElementById('form');
      var input = document.getElementById('input');
      let feedback = document.getElementById("feedback");
      let notendanafn = document.getElementById("notendanafnGildiText");
      let randomNames = ["Mr. Nice Guy","Moss","Jen Barber","Asmongold"]//í tilefni þess að þú sýndir okkur random nöfn ef ekkert er valið, þá varð ég að gera eitthvað slíkt

    
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value) {
          socket.emit('chat message', input.value);
          input.value = '';
          $(".liItem").remove();
        }
      }); 

      socket.on("chat_init", (chat_log) =>{
        for(var i = 0; i < chat_log.length; i++) {
          var item_chat = document.createElement('li');
         
          item_chat.textContent = chat_log[i].user + ": " + chat_log[i].message;
          messages.appendChild(item_chat);
          
          window.scrollTo(0, document.body.scrollHeight);
        }
      });

      socket.on('chat message', function(msg) {
        var item = document.createElement('li');
        
        item.textContent = msg;
        messages.appendChild(item);
       
        $(".liItem").remove();

        window.scrollTo(0, document.body.scrollHeight);
      });

      //Function til þess að fela chattið
      function felaChat() {
         document.getElementById("fela").style.display = "none";
      }

      //Function sem felur username formið og sýnir chattið
      function synaChat() {
        document.getElementById("fela").style.display = "";
        document.getElementById("userForm").style.display = "none";
      }

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

      input.addEventListener("keydown", function() {
        socket.emit("typing", notendanafn);

        setTimeout(function(){
           $(".liItem").remove()
        },3000);
      });

      //Fel chattið þegar glugginn er opnaður
      window.onload = felaChat;

      document.getElementById("userNameValue").addEventListener("click", () => {
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
