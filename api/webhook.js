// api/webhook.js

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { categoria, piatto, prezzo, ingredienti } = req.body.queryResult.parameters;

    const menuEntry = {
      nome: piatto,
      prezzo: prezzo,
      ingredienti: ingredienti.split(',').map(s => s.trim()),
      allergeni: [],
    };

    const menuId = Date.now().toString();
    const fileName = `${menuId}.json`;
    const bucketName = 'tuo-menu-ristorante'; // Sostituisci con il tuo bucket GCS

    const file = storage.bucket(bucketName).file(fileName);
    await file.save(JSON.stringify(menuEntry, null, 2), {
      contentType: 'application/json',
      predefinedAcl: 'publicRead'
    });

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    const linkToMenu = `https://tuo-sito-web.vercel.app/menu.html?url=${fileUrl}`; // Sostituisci con il tuo URL

    res.status(200).json({
      fulfillmentText: `Perfetto, ho aggiunto il tuo piatto! Puoi visualizzare il menù aggiornato a questo link: ${linkToMenu}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      fulfillmentText: 'Mi dispiace, c\'è stato un errore nel salvare il menù. Riprova più tardi.'
    });
  }
}