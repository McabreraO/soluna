let recognition;
let mensajes = [];
let escuchando = false;


// =======================
// BASE CONVERSACIONAL
// =======================


let baseConversacional = [
  { patrones: ["hola", "buenas"], respuestas: ["Hola 👋", "Hola!"] },
  { patrones: ["como estas"], respuestas: ["Bien 😊", "Funcionando bien"] },
  { patrones: ["gracias"], respuestas: ["De nada 😊"] },
  { patrones: ["adios", "chao"], respuestas: ["Hasta luego 👋"] }
];


// =======================


function setup() {


  createCanvas(900, 700);
  textFont("Arial");


  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {
    agregarMensaje("bot", "Sin soporte de voz.");
    return;
  }


  recognition = new SpeechRecognition();
  recognition.lang = "es-CL";


  agregarMensaje("bot", "Chat listo.");


  recognition.onstart = () => escuchando = true;
  recognition.onend = () => escuchando = false;


  recognition.onresult = (e) => {


    let texto = e.results[0][0].transcript;


    agregarMensaje("usuario", texto);


    procesarPregunta(texto);
  };
}


// =======================
// DRAW (INTERFAZ MEJORADA)
// =======================


function draw() {


  background(15);


  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("CHATBOT", width / 2, 40);


  fill(30);
  rect(40, 80, 820, 520, 20);


  let visibles = mensajes.slice(-6);


  let y = 120;


  for (let m of visibles) {


    textSize(16);


    let anchoTexto = 660;
    let h = calcularAlturaTexto(m.texto, anchoTexto) + 20;


    // USUARIO
    if (m.autor === "usuario") {


      fill(0, 150, 255);
      rect(100, y, 700, h, 12);


      fill(255);
      textAlign(LEFT, TOP);
      text(m.texto, 120, y + 10, anchoTexto);


    // BOT
    } else {


      fill(70);
      rect(100, y, 700, h, 12);


      fill(255);
      textAlign(LEFT, TOP);
      text(m.texto, 120, y + 10, anchoTexto);
    }


    y += h + 15;
  }


  // MIC
  fill(escuchando ? "green" : "red");
  ellipse(width / 2, 650, 80);
}


// =======================
// CLICK MIC
// =======================


function mousePressed() {


  let d = dist(mouseX, mouseY, width / 2, 650);


  if (d < 50) recognition.start();
}


// =======================
// MENSAJES
// =======================


function agregarMensaje(a, t) {
  mensajes.push({ autor: a, texto: t });
}


// =======================
// FLUJO
// =======================


function procesarPregunta(texto) {


  let t = normalizar(texto);


  let base = buscarBase(t);


  if (base) {
    responder(base);
    return;
  }


  let concepto = extraerSimple(t);


  buscarWikipedia(concepto);
}


// =======================
// BASE CONVERSACIONAL
// =======================


function buscarBase(t) {


  for (let item of baseConversacional) {


    for (let p of item.patrones) {


      if (t.includes(p)) {
        return random(item.respuestas);
      }
    }
  }


  return null;
}


// =======================
// WIKIPEDIA
// =======================


async function buscarWikipedia(q) {


  try {


    if (!q || q.length < 2) {
      responder("No entendí la pregunta.");
      return;
    }


    let url =
      "https://es.wikipedia.org/w/api.php?origin=*&action=query&list=search&format=json&srsearch=" +
      encodeURIComponent(q);


    let res = await fetch(url);
    let data = await res.json();


    if (!data.query.search.length) {
      responder("No encontré información.");
      return;
    }


    let titulo = data.query.search[0].title;


    let url2 =
      "https://es.wikipedia.org/api/rest_v1/page/summary/" +
      encodeURIComponent(titulo);


    let res2 = await fetch(url2);
    let data2 = await res2.json();


    let text = data2.extract || "No hay resumen.";


    responder(text.split(".")[0]);


  } catch (e) {


    responder("Error buscando información.");
  }
}


// =======================
// RESPONDER
// =======================


function responder(t) {


  agregarMensaje("bot", t);
  hablar(t);
}


// =======================
// VOZ
// =======================


function hablar(t) {


  let u = new SpeechSynthesisUtterance(t);
  u.lang = "es-CL";
  speechSynthesis.speak(u);
}


// =======================
// NORMALIZAR
// =======================


function normalizar(t) {


  return t.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


// =======================
// LIMPIEZA SIMPLE
// =======================


function extraerSimple(t) {


  let stop = ["que", "quien", "es", "fue", "el", "la", "de", "como"];


  return t.split(" ")
    .filter(w => !stop.includes(w))
    .join(" ")
    .trim();
}


// =======================
// ALTURA DINÁMICA (UI FIX CLAVE)
// =======================


function calcularAlturaTexto(texto, ancho) {


  textSize(16);


  let palabras = texto.split(" ");
  let linea = "";
  let lineas = 1;


  for (let i = 0; i < palabras.length; i++) {


    let test = linea + palabras[i] + " ";
    let w = textWidth(test);


    if (w > ancho) {


      lineas++;
      linea = palabras[i] + " ";


    } else {


      linea = test;
    }
  }


  return lineas * 22;
}



