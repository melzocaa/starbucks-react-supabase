import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const GREEN = '#0d6e00';
const DARKGREEN = '#063600';

function App(){
  const [categorias,setCategorias]=useState([]);
  const [produtos,setProdutos]=useState([]);
  const [categoria,setCategoria]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [mobile,setMobile]=useState(false);
  const [detalhe,setDetalhe]=useState(null);
  const [cart,setCart]=useState([]);
  const [cartOpen,setCartOpen]=useState(false);

  async function carregar(){
    setLoading(true); setError('');
    const [c,p]=await Promise.all([
      supabase.from('categorias').select('*').order('id'),
      supabase.from('produtos').select('*').order('id')
    ]);
    if(c.error || p.error){
      setError(c.error?.message || p.error?.message || 'Erro ao carregar os dados.');
      setLoading(false); return;
    }
    setCategorias(c.data||[]);
    setProdutos(p.data||[]);
    if(c.data?.length && categoria===null) setCategoria(c.data[0].id);
    setLoading(false);
  }
  useEffect(()=>{carregar()},[]);

  const filtrados=useMemo(()=>{
    if(categoria===null) return produtos;
    return produtos.filter(p=>String(p.categoriaId ?? p.categoria_id)===String(categoria));
  },[produtos,categoria]);

  const total=cart.reduce((s,i)=>s+i.preco*i.quantidade,0);
  const quantidade=cart.reduce((s,i)=>s+i.quantidade,0);

  function imagem(p){
    return p.imagem?.startsWith('http') ? p.imagem : `/assets/images/${p.imagem || 'logo.png'}`;
  }
  function add(p){
    setCart(old=>{
      const found=old.find(i=>String(i.id)===String(p.id));
      if(found) return old.map(i=>String(i.id)===String(p.id)?{...i,quantidade:i.quantidade+1}:i);
      return [...old,{id:p.id,nome:p.nome,preco:Number(p.preco),quantidade:1}];
    });
    setDetalhe(null);
  }
  function format(v){return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}

  return <div className="min-h-screen bg-white">
    <header className="w-auto text-center p-0 mt-20">
      <img src="/assets/images/logo.png" alt="Starbucks Coffee" className="inline-block"/>
      <nav className="w-auto text-center font-bold hidden md:block">
        <ul className="list-none p-0"><li className="inline-block px-5"><a href="#cardapio" className="no-underline text-[#222222] hover:text-[#0d6e00] transition-colors duration-200">CARDÁPIO</a></li></ul>
      </nav>
      <button onClick={()=>setMobile(true)} className="md:hidden text-3xl mt-2">☰</button>
    </header>

    <div className={`fixed top-0 ${mobile?'right-0':'right-[-100%]'} w-[70%] h-full bg-white shadow-lg transition-all duration-300 p-8 md:hidden z-50`}>
      <button onClick={()=>setMobile(false)} className="text-2xl mb-6">✕</button>
      <ul className="flex flex-col gap-6 text-lg"><li><a onClick={()=>setMobile(false)} href="#cardapio">Cardápio</a></li></ul>
    </div>

    <section className="w-full text-center mt-8">
      <div className="inline-block align-middle w-[30%] max-[900px]:w-full max-[900px]:mb-[1.875rem]">
        <p className="text-[2.5rem] text-left px-[10%] max-[900px]:text-[1.625rem] max-[900px]:text-center max-[900px]:px-[5%]">O verdadeiro sabor do café!</p>
        <p className="text-[2.5rem] text-left px-[10%] max-[900px]:text-[1.625rem] max-[900px]:text-center max-[900px]:px-[5%] mt-4">
          <a className="bg-[#a7c4a3] rounded-[2.5rem] p-[3%] text-[1.25rem] no-underline text-[#222222] hover:text-[#0d6e00] transition-colors duration-200 inline-block" href="#cardapio">VEJA O CARDÁPIO</a>
        </p>
      </div>
      <div className="inline-block align-middle w-[30%] max-[900px]:w-full max-[900px]:mb-[1.875rem]">
        <img className="w-[90%] !w-[40%] min-w-[200px] animate-flutuar mx-auto" src="/assets/images/img1.png" alt="Café"/>
      </div>
    </section>

    <section id="cardapio" className="max-w-[90vw] mx-auto mt-[5vh] p-8">
      <h2 className="text-3xl font-bold text-center mt-12 pt-8 border-t-2 border-dotted border-[#222222] mb-8">Cardápio</h2>

      <nav className="overflow-x-auto whitespace-nowrap snap-x flex gap-2 mt-6 pb-1">
        {loading ? [1,2,3].map(x=><div key={x} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"/>) :
          categorias.map(c=><button key={c.id} onClick={()=>setCategoria(c.id)}
            className="snap-start px-4 py-2 rounded-full font-bold text-sm transition-all duration-150 cursor-pointer flex-shrink-0"
            style={{backgroundColor:String(categoria)===String(c.id)?GREEN:'#ebebeb',color:String(categoria)===String(c.id)?'#fff':'#222'}}>
            {c.nome}
          </button>)}
      </nav>

      <div className="mt-8">
        <div className="text-left text-[#222222] font-extrabold text-[22px] mb-4">
          {categorias.find(c=>String(c.id)===String(categoria))?.nome || (loading?'Iniciando...':'Cardápio')}
        </div>
        {error && <div className="text-red-500 py-6">{error}</div>}
        {!error && loading && <div className="py-10 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d6e00]"/></div>}
        {!loading && !error && <div className="grid grid-cols-2 gap-4">
          {filtrados.length===0 ? <p className="col-span-2 text-gray-500 py-10">Nenhum produto nesta categoria.</p> :
          filtrados.map(p=><div key={p.id} className="bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 relative flex flex-col hover:shadow-md transition-shadow group">
            <div className="absolute inset-0 z-0 cursor-pointer" onClick={()=>setDetalhe(p)}/>
            <img src={imagem(p)} alt={p.nome} className="w-full h-24 object-contain mb-2 mt-2 transition-transform duration-300 drop-shadow-sm group-hover:scale-105 pointer-events-none relative z-10" onError={e=>e.currentTarget.src='/assets/images/logo.png'}/>
            <div className="text-left w-full mt-auto relative z-10 pointer-events-none">
              <h4 className="font-bold text-[#222222] text-sm leading-tight">{p.nome}</h4>
              <p className="text-[#0d6e00] font-bold text-sm mt-1">{format(p.preco)}</p>
            </div>
            <button onClick={()=>add(p)} style={{backgroundColor:GREEN}} className="w-full text-white py-2 rounded-xl text-xs font-bold mt-3 shadow-md hover:opacity-90 active:scale-95 transition-all z-10 relative">Adicionar</button>
          </div>)}
        </div>}
      </div>
    </section>

    <footer className="mt-[6.25rem] w-auto text-center p-[1.25rem] text-[0.875rem] text-black bg-[#89a885]">
      <h3 className="text-[1.17em] font-bold my-[1em]">☕ Starbucks Coffee</h3>
      <p className="m-[0.2rem] text-[#222222]">📍 Rua Prof. Toledo, 500, centro - Sorocaba</p>
      <p className="m-[0.2rem] text-[#222222]">📞 WhatsApp: (15) 9999-1234</p>
      <p className="m-[0.2rem] text-[#222222]">🕧 Aberto todos os dias das 14h às 23h</p>
    </footer>

    <a href="https://wa.me/5515991456699" target="_blank" className="fixed right-5 bottom-5 z-40">
      <img src="/assets/images/whatsapp.png" alt="link-whatsapp" className="w-10"/>
    </a>

    {detalhe && <div className="fixed inset-0 bg-black/70 z-[80] flex justify-center items-center px-4" onClick={()=>setDetalhe(null)}>
      <div className="bg-white w-full max-w-[400px] rounded-[30px] overflow-hidden relative flex flex-col" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setDetalhe(null)} className="absolute top-4 right-4 bg-white/80 text-gray-900 w-10 h-10 rounded-full flex justify-center items-center font-bold text-2xl shadow-sm z-10">×</button>
        <img src={imagem(detalhe)} alt={detalhe.nome} className="w-full h-48 object-contain mt-4"/>
        <div className="p-6">
          <h2 className="text-3xl font-black text-gray-900 mb-1 leading-tight">{detalhe.nome}</h2>
          <p className="text-2xl font-black text-[#063600] mb-4">{format(detalhe.preco)}</p>
          <div className="bg-[#ceddcc]/30 border border-[#ceddcc] rounded-xl p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed font-medium">{detalhe.descricao || 'Descrição não informada.'}</p>
          </div>
          <button onClick={()=>add(detalhe)} className="w-full bg-[#063600] text-white py-4 rounded-xl text-[17px] font-extrabold shadow-lg">Adicionar ao Pedido</button>
        </div>
      </div>
    </div>}

    <div className={`fixed bottom-0 left-0 w-full bg-[#063600] text-white p-4 z-50 shadow-[0_-4px_6px_rgba(0,0,0,0.1)] transition-transform duration-300 flex justify-between items-center cursor-pointer ${quantidade?'translate-y-0':'translate-y-full'}`} onClick={()=>setCartOpen(true)}>
      <div><p className="text-sm font-medium">Resumo do Pedido</p><p className="text-xl font-bold">Total: {format(total)}</p></div>
      <button className="bg-white text-[#063600] px-4 py-2 rounded-lg font-bold shadow-md">Ver Carrinho</button>
    </div>

    {cartOpen && <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end sm:justify-center items-center" onClick={()=>setCartOpen(false)}>
      <div className="bg-white w-full sm:w-[500px] max-h-[85vh] rounded-t-3xl sm:rounded-2xl flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center bg-[#ceddcc]/20 rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-2xl font-bold text-[#063600]">Seu Carrinho</h2>
          <button onClick={()=>setCartOpen(false)} className="text-3xl font-bold text-gray-400">×</button>
        </div>
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          {cart.map(i=><div key={i.id} className="flex justify-between items-center border-b pb-3">
            <div><strong>{i.nome}</strong><p className="text-sm text-gray-500">{i.quantidade}x {format(i.preco)}</p></div>
            <button onClick={()=>setCart(c=>c.filter(x=>x.id!==i.id))} className="text-red-500 font-bold">Remover</button>
          </div>)}
          {!cart.length && <p className="text-gray-500">Seu carrinho está vazio.</p>}
        </div>
        <div className="p-5 border-t bg-gray-50 rounded-b-3xl">
          <div className="flex justify-between items-center mb-4"><span className="text-lg font-bold">Total do Pedido:</span><span className="text-2xl font-black text-[#063600]">{format(total)}</span></div>
          <button onClick={()=>setCartOpen(false)} className="w-full bg-[#063600] text-white py-3 rounded-xl text-lg font-bold">Fechar Pedido</button>
        </div>
      </div>
    </div>}
  </div>
}
export default App;
