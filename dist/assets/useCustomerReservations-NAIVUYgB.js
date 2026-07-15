import{c as u,l as h,r as t}from"./index-C2wxjOiL.js";import{b as m}from"./reservations-BVaJgU3m.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=u("CalendarPlus",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["path",{d:"M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8",key:"3spt84"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M16 19h6",key:"xwg31i"}],["path",{d:"M19 16v6",key:"tddt3s"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=u("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);function M(){const{session:s}=h(),[a,o]=t.useState([]),[l,r]=t.useState(!0),[d,c]=t.useState(null),n=t.useCallback(async()=>{if(!s){o([]),r(!1);return}try{r(!0);const e=await m(s.user.id);o(e),c(null)}catch(e){c(e instanceof Error?e.message:"Errore nel caricamento prenotazioni")}finally{r(!1)}},[s]);t.useEffect(()=>{n()},[n]);const p=Date.now(),i=a.filter(e=>["pending","confirmed"].includes(e.status)&&new Date(e.starts_at).getTime()>=p),f=a.filter(e=>!i.includes(e));return{reservations:a,upcoming:i,past:f,loading:l,error:d,refetch:n}}export{v as C,g as U,M as u};
