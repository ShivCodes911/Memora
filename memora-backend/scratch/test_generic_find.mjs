import fs from 'node:fs';
import vm from 'node:vm';

const folderId = "15uNXeRBIhVvZJIhL4yTw4IsStMhUaaxl";
const url = `https://drive.google.com/drive/folders/${folderId}`;

async function testGeneric() {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  const html = await res.text();
  const callbacks = [...html.matchAll(/AF_initDataCallback\s*\(\s*({[\s\S]*?})\s*\);/g)];
  
  const allFoundItems = [];
  
  for (const cb of callbacks) {
    try {
      const parsed = vm.runInNewContext(`(${cb[1]})`, {});
      const data = parsed.data;
      if (!data) continue;
      
      function searchForItems(node) {
        if (!node || !Array.isArray(node)) return;
        
        // Item check: array of items where EACH item has [null, 'alphanumeric_id_25+'] at index 0
        const isItemList = node.length > 0 && node.every(it => {
          if (!Array.isArray(it) || !Array.isArray(it[0])) return false;
          const id = it[0][1];
          return typeof id === 'string' && /^[a-zA-Z0-9_-]{20,60}$/.test(id);
        });
        
        if (isItemList) {
          allFoundItems.push(...node);
          return;
        }
        
        for (const child of node) {
          if (Array.isArray(child)) searchForItems(child);
        }
      }
      
      searchForItems(data);
    } catch (e) {
      // ignore
    }
  }
  
  console.log("Total valid items found:", allFoundItems.length);
  allFoundItems.forEach((it, idx) => {
    const id = it[0]?.[1];
    const mime = it[4];
    const name = it[35]?.[0]?.[0]?.[0] || it[24]?.[2]?.[0]?.[2]?.[1]?.[0]?.[0]?.[0];
    console.log(`[${idx}] id=${id} | mime=${mime} | name=${name}`);
  });
}
testGeneric();
