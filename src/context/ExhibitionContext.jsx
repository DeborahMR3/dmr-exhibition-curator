// trago ferramentas do react
import React, { createContext, useContext, useEffect, useState } from "react";

/*
  o que estou criando aqui:
  - exhibitioncontext: é o "pote" (o canal) onde vou guardar a coleção
  - exhibitionprovider: é o "abraço" que fornece esse pote para os filhos
  - useexhibition: é um atalho para pegar o pote de dentro dos filhos
*/

// crio o "pote" (o canal). nome escolhido por mim. o null é o valor inicial.
export const ExhibitionContext = createContext(null);

// este componente "abraça" a ui e entrega o value do contexto para os filhos
export function ExhibitionProvider(props) {
  // items = minha lista de obras salvas na exposição (começa vazia)
  const [items, setItems] = useState([]);

  // ao montar: tento carregar do sessionstorage (persiste até fechar a aba)
  useEffect(function () {
    try {
      const saved = sessionStorage.getItem("exhibition-items"); // chave escolhida por mim
      if (saved) {
        setItems(JSON.parse(saved)); // transformo texto em lista
      }
    } catch (error) {
      // se der erro de privacidade/espaco, eu apenas sigo com lista vazia
    }
  }, []);

  // quando items mudar: salvo no sessionstorage (como texto)
  useEffect(function () {
    try {
      sessionStorage.setItem("exhibition-items", JSON.stringify(items));
    } catch (error) {
      // se não conseguir salvar, ignoro (a app continua funcionando)
    }
  }, [items]);

  // adiciona um item sem duplicar
  function addItem(object) {
    // cada museu usa um nome diferente para id, então padronizo aqui
    const uniqueKey = object.objectID || object.id; // met: objectid | aic/harvard: id
    if (uniqueKey == null) return; // sem id eu não consigo identificar

    // forma funcional: o react me entrega a lista mais atual em previusitems
    setItems(function (previusItems) {
      // checo se já existe um item com o mesmo id
      const exists = previusItems.some(function (item) {
        return (item.objectID || item.id) === uniqueKey;
      });
      if (exists) {
        // já está na coleção: devolvo a mesma lista (evito re-render desnecessário)
        return previusItems;
      }
      // crio um novo array (não muto o antigo) colando o objeto no fim
      const novaLista = previusItems.concat(object); // poderia ser [...previusitems, object]
      return novaLista;
    });
  }

  // remove um item pelo id
  function removeItem(object) {
    const uniqueKey = object.objectID || object.id;
    if (uniqueKey == null) return;

    // filter cria uma nova lista sem o item (também é imutável)
    setItems(function (previusItems) {
      const novaLista = previusItems.filter(function (item) {
        return (item.objectID || item.id) !== uniqueKey;
      });
      return novaLista;
    });
  }

  // diz se um item já está na coleção (para mostrar "add" ou "remove" no card)
  function isSelected(object) {
    const uniqueKey = object.objectID || object.id;
    if (uniqueKey == null) return false;
    return items.some(function (item) { return (item.objectID || item.id) === uniqueKey; });
  }

  // o "value" é o pacote de coisas que os filhos vão poder usar
  const value = {
    items,               // a lista de obras salvas
    addItem,             // função para adicionar
    removeItem,          // função para remover
    isSelected,          // checar se já está na lista
    count: items.length, // contador pronto para mostrar no topo
  };

  // aqui eu de fato "abraço" os filhos e entrego o value do contexto
  return (
    <ExhibitionContext.Provider value={value}>
      {props.children} {/* tudo que estiver aqui dentro recebe o value */}
    </ExhibitionContext.Provider>
  );
}

// atalho para consumir o contexto dentro dos filhos (sem mexer com usecontext direto)
export function useExhibition() {
  const context = useContext(ExhibitionContext); // leio o pote
  if (!context) {
    // isso aparece se alguém usar fora do provider
    throw new Error("useExhibition precisa estar dentro de <ExhibitionProvider>");
  }
  return context;
}
