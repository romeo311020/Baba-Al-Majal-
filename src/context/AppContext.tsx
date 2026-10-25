import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type AppCtx = {lang:'ar'|'en'; setLang:(v:'ar'|'en')=>void; favorites:string[]; toggleFavorite:(id:string)=>void};
const Context = createContext<AppCtx | null>(null);
export function AppProvider({children}:{children:ReactNode}) {
 const [lang,setLangState]=useState<'ar'|'en'>(()=>(localStorage.getItem('yr-lang') as 'ar'|'en')||'ar');
 const [favorites,setFavorites]=useState<string[]>(()=>JSON.parse(localStorage.getItem('yr-favorites')||'[]'));
 const setLang=(v:'ar'|'en')=>{setLangState(v);localStorage.setItem('yr-lang',v)};
 const toggleFavorite=(id:string)=>setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
 useEffect(()=>localStorage.setItem('yr-favorites',JSON.stringify(favorites)),[favorites]);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr'},[lang]);
 return <Context.Provider value={{lang,setLang,favorites,toggleFavorite}}>{children}</Context.Provider>
}
export function useApp(){const value=useContext(Context);if(!value)throw new Error('useApp must be used inside AppProvider');return value}
