'use strict';

// A standalone, deterministic UI dataset, not the Python generator's output.
// Schema uses borrowing concepts from ingestion/lms_connector.py.
const GENRES = ['Fiction', 'History', 'Technology', 'Children', 'Mystery', 'Biography'];
const MONTHS = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
const NAMES = ['January', 'February', 'March', 'April', 'May', 'June'];
const TITLES = ['The Quiet Harbor', 'Cities Through Time', 'Practical Computing', 'The Little Explorer', 'The Missing Letter', 'A Life in Motion', 'Beyond the Valley', 'Mapping the Past', 'Learning with Data', 'The Moon Garden', 'Clues at Sunrise', 'Journeys of Discovery'];

function makeRecords() {
  let seed = 42;
  const next = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  return Array.from({length:1200}, (_, i) => {
    const book = Math.floor(next() * TITLES.length);
    const month = MONTHS[Math.floor(next() * MONTHS.length)];
    const day = String(1 + Math.floor(next() * 28)).padStart(2, '0');
    return {transaction_id:`T${String(i + 1).padStart(5,'0')}`, patron_id:`DEMO-P${String(1 + Math.floor(next()*120)).padStart(3,'0')}`, book_id:`DEMO-B${book+1}`, book_title:TITLES[book], genre:GENRES[book % GENRES.length], checkout_date:`${month}-${day}`, loan_duration_days:7 + Math.floor(next()*22)};
  });
}
const records = makeRecords();
function selectRecords(month, genre) {
  return records.filter(r => (month === 'all' || r.checkout_date.startsWith(month)) && (genre === 'all' || r.genre === genre));
}
function summarize(rows) {
  return {checkouts:rows.length, patrons:new Set(rows.map(r=>r.patron_id)).size, titles:new Set(rows.map(r=>r.book_id)).size, duration:rows.length ? rows.reduce((s,r)=>s+r.loan_duration_days,0)/rows.length : null};
}
function csv(rows) {
  const keys = ['transaction_id','patron_id','book_id','book_title','genre','checkout_date','loan_duration_days'];
  const quote = value => '"' + String(value).replace(/"/g,'""') + '"';
  return [keys.join(','), ...rows.map(r=>keys.map(k=>quote(r[k])).join(','))].join('\r\n');
}
function bars(id, pairs) {
  const root = document.getElementById(id);
  root.replaceChildren();
  const max = Math.max(1, ...pairs.map(p=>p[1]));
  for (const [label, value] of pairs) {
    const row = document.createElement('div'); row.className='bar-row';
    const name = document.createElement('span'); name.textContent=label;
    const track=document.createElement('div');track.className='track';track.setAttribute('aria-hidden','true');
    const fill=document.createElement('div');fill.className='fill';fill.style.width=`${value/max*100}%`;track.append(fill);
    const count=document.createElement('span');count.textContent=value;
    row.append(name,track,count);root.append(row);
  }
}
function render() {
  const month=document.getElementById('month').value, genre=document.getElementById('genre').value;
  const rows=selectRecords(month,genre), metrics=summarize(rows);
  for(const key of ['checkouts','patrons','titles']) document.getElementById(key).textContent=metrics[key].toLocaleString('en-US');
  document.getElementById('duration').textContent=metrics.duration===null?'—':metrics.duration.toFixed(1);
  document.getElementById('summary').textContent=`${rows.length.toLocaleString('en-US')} synthetic records · ${month==='all'?'January–June 2024':NAMES[MONTHS.indexOf(month)]+' 2024'} · ${genre==='all'?'All genres':genre}. Titles borrowed does not measure the full catalog.`;
  bars('monthly-bars',MONTHS.filter(m=>month==='all'||m===month).map(m=>[NAMES[MONTHS.indexOf(m)],rows.filter(r=>r.checkout_date.startsWith(m)).length]));
  bars('genre-bars',GENRES.filter(g=>genre==='all'||g===genre).map(g=>[g,rows.filter(r=>r.genre===g).length]));
  const counts=new Map();
  for(const r of rows){if(!counts.has(r.book_id))counts.set(r.book_id,{title:r.book_title,genre:r.genre,count:0});counts.get(r.book_id).count++;}
  const body=document.getElementById('books');body.replaceChildren();
  for(const book of [...counts.values()].sort((a,b)=>b.count-a.count||a.title.localeCompare(b.title)).slice(0,8)){
    const tr=document.createElement('tr');for(const value of [book.title,book.genre,book.count]){const td=document.createElement('td');td.textContent=value;tr.append(td);}body.append(tr);
  }
  if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=3;td.textContent='No records match these filters. Try resetting them.';tr.append(td);body.append(tr);}
  document.getElementById('export').disabled=!rows.length;
}
if(typeof document!=='undefined'){
  const selector=document.getElementById('genre');for(const genre of GENRES){const option=document.createElement('option');option.value=genre;option.textContent=genre;selector.append(option);}
  for(const id of ['month','genre'])document.getElementById(id).addEventListener('change',render);
  document.getElementById('reset').addEventListener('click',()=>{document.getElementById('month').value='all';selector.value='all';render();});
  document.getElementById('export').addEventListener('click',()=>{
    const month=document.getElementById('month').value,genre=selector.value;
    const url=URL.createObjectURL(new Blob([csv(selectRecords(month,genre))],{type:'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`librarypulse-synthetic-${month}-${genre.toLowerCase()}.csv`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });render();
}
if(typeof module!=='undefined')module.exports={records,selectRecords,summarize,csv,makeRecords};
