const Koa = require("koa");
const app = new Koa();
const server = require("http").createServer(app.callback());
const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });
const Router = require("koa-router");
const cors = require("koa-cors");
const bodyparser = require("koa-bodyparser");

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.response.body = {
      issue: [{ error: err.message || "Unexpected error" }],
    };
    ctx.response.status = 500;
  }
});

class Note {
  constructor({ id, title, message, done, lastChange, characters }) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.done = done;
    this.lastChange = lastChange;
    this.characters = characters;
  }
}

// hard code
const notes = [];
for (let i = 0; i < 11; i++) {
  var message = `Description ${i}`;
  notes.push(
    new Note({
      id: `${i}`,
      title: `Note ${i}`,
      message: message,
      done: true,
      lastChange: new Date(Date.now() + i),
      characters: message.length,
    })
  );
}

// info
let lastUpdated = notes[notes.length - 1].lastChange;
let lastId = notes[notes.length - 1].id;
const pageSize = 10;

const broadcast = (data) =>
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });

const router = new Router();

// getAll()
router.get("/notes", (ctx) => {
  const ifModifiedSince = ctx.request.get("If-Modif ied-Since");
  if (
    ifModifiedSince &&
    new Date(ifModifiedSince).getTime() >=
      lastUpdated.getTime() - lastUpdated.getMilliseconds()
  ) {
    ctx.response.status = 304; // NOT MODIFIED
    return;
  }

  console.log(lastUpdated);

  const text = ctx.request.query.text;
  const page = parseInt(ctx.request.query.page) || 1;
  ctx.response.set("Last-Modified", lastUpdated.toUTCString());
  const sortedNotes = notes
    .filter((note) => (text ? note.text.indexOf(text) !== -1 : true))
    .sort((n1, n2) => -(n1.lastChange.getTime() - n2.lastChange.getTime()));
  const offset = (page - 1) * pageSize;
  // ctx.response.body = {
  //   page,
  //   notes: sortedNotes.slice(offset, offset + pageSize),
  //   more: offset + pageSize < sortedNotes.length
  // };
  ctx.response.body = notes;
  ctx.response.status = 200;
});

router.get("/note/:id", async (ctx) => {
  const noteId = ctx.request.params.id;
  const note = notes.find((note) => noteId === note.id);
  if (note) {
    ctx.response.body = note;
    ctx.response.status = 200; // ok
  } else {
    ctx.response.body = {
      issue: [{ warning: `note with id ${noteId} not found` }],
    };
    ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
  }
});

const createNote = async (ctx) => {
  const note = ctx.request.body;
  if (!note.title) {
    // validation
    ctx.response.body = { issue: [{ error: "Title is missing" }] };
    ctx.response.status = 400; //  BAD REQUEST
    return;
  }
  note.id = `${parseInt(lastId) + 1}`;
  lastId = note.id;
  note.lastChange = new Date();
  note.characters = note.message.length;
  notes.push(note);
  ctx.response.body = note;
  ctx.response.status = 201; // CREATED
  broadcast({ event: "created", payload: { note } });
};

router.post("/note", async (ctx) => {
  await createNote(ctx);
});

router.put("/note/:id", async (ctx) => {
  const id = ctx.params.id;
  const note = ctx.request.body;
  note.lastChange = new Date();
  note.characters = note.message.length;
  const noteId = note.id;
  if (noteId && id !== note.id) {
    r;
    ctx.response.body = {
      issue: [{ error: `Paam id and body id should be the same` }],
    };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  if (!noteId) {
    await createNote(ctx);
    return;
  }

  const index = notes.findIndex((note) => note.id === id);
  if (index === -1) {
    ctx.response.body = { issue: [{ error: `note with id ${id} not found` }] };
    ctx.response.status = 400; // BAD REQUEST
    return;
  }
  notes[index] = note;
  lastUpdated = new Date();
  ctx.response.body = note;
  ctx.response.status = 200; // OK
  broadcast({ event: "updated", payload: { note } });
});

router.del("/note/:id", (ctx) => {
  const id = ctx.params.id;
  const index = notes.findIndex((note) => id === note.id);
  if (index !== -1) {
    const note = notes[index];
    notes.splice(index, 1);
    lastUpdated = new Date();
    broadcast({ event: "deleted", payload: { note } });
  }
  ctx.response.status = 204; // no content
});

setInterval(() => {
  lastUpdated = new Date();
  lastId = `${parseInt(lastId) + 1}`;
  const note = new Note({
    id: lastId,
    text: `note ${lastId}`,
    date: lastUpdated,
    version: 1,
  });
  notes.push(note);
  console.log(`
   ${note.text}`);
  broadcast({ event: "created", payload: { note } });
}, 150000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(8080);