import React from 'react';
import { observer } from 'mobx-react-lite';
import { openDB } from 'idb';

const App: React.FC = () => {


  async function demo() {
    const db = await openDB('Articles', 1, {
      upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore('articles', {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        });
        // Create an index on the 'date' property of the objects.
        store.createIndex('date', 'date');
      },
    });
  
    // Add an article:
    await db.add('articles', {
      body: '…',
      title: 'Article DWP 01',
      date: new Date('2019-01-01'),
    });
  
    // Add multiple articles in one transaction:
    {
      const tx = db.transaction('articles', 'readwrite');
      await Promise.all([
        tx.store.add({
          body: '…',
          title: 'Article DWP 02',
          date: new Date('2019-01-01'),
        }),
        tx.store.add({
          body: '…',
          title: 'Article DWP 03',
          date: new Date('2019-01-02'),
        }),
        tx.done,
      ]);
    }
  
    // Get all the articles in date order:
     console.log(await db.getAllFromIndex('articles', 'date'));
  
    // Add 'And, happy new year!' to all articles on 2019-01-01:
    {
      const tx = db.transaction('articles', 'readwrite');
      const index = tx.store.index('date');
      for await (const cursor of index.iterate(new Date('2019-01-01'))) {
        const article = { ...cursor.value };
        article.body += ' And, happy new year!';
        cursor.update(article);
      }
      
      await tx.done;
    }
  }
  demo().then(result => console.log("result", result)).catch(error => alert(error));

  return (
    <div className="App">
     <h1>IndexedDB example</h1>
    </div>
  );
}

export default observer(App);
