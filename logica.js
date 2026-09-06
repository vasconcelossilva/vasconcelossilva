import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
  import { getFirestore, collection, query, where, orderBy, getDocs }
    from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDIqmamaruqLunclQ_tzarz-EVKG0m6KjM",
    authDomain: "f-vasconcelos-silva.firebaseapp.com",
    projectId: "f-vasconcelos-silva",
    storageBucket: "f-vasconcelos-silva.firebasestorage.app",
    messagingSenderId: "457227568677",
    appId: "1:457227568677:web:ddb997ace1bcbd986321cc"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const CORES = ['is-light', 'is-dark', 'is-green'];

  function formatarData(valor) {
    if (!valor) return '';
    const data = valor.toDate ? valor.toDate() : new Date(valor);
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function montarParagrafos(texto) {
    return (texto || '')
      .split(/\n\s*\n/)
      .filter(function (bloco) { return bloco.trim() !== ''; })
      .map(function (bloco) {
        const p = document.createElement('p');
        p.textContent = bloco.trim();
        return p;
      });
  }

  function criarPainel(dados, indice) {
    const secao = document.createElement('section');
    secao.className = 'panel panel-service panel-artigo ' + CORES[indice % CORES.length];

    const conteudo = document.createElement('div');
    conteudo.className = 'panel-content';

    const data = document.createElement('span');
    data.className = 'artigo-data';
    data.textContent = formatarData(dados.data);

    const titulo = document.createElement('h3');
    titulo.textContent = dados.titulo || '';

    const resumo = document.createElement('p');
    resumo.textContent = dados.resumo || '';

    let imagem = null;
    if ((dados.imagem || '').trim() !== '') {
      imagem = document.createElement('img');
      imagem.className = 'artigo-img';
      imagem.src = dados.imagem.trim();
      imagem.alt = '';
      imagem.loading = 'lazy';
      imagem.addEventListener('load', function () {
        if (window.ajustarFolhasAltas) window.ajustarFolhasAltas();
      });
    }

    const corpo = document.createElement('div');
    corpo.className = 'artigo-conteudo';
    montarParagrafos(dados.conteudo).forEach(function (p) { corpo.appendChild(p); });

    const botao = document.createElement('button');
    botao.className = 'artigo-toggle';
    botao.type = 'button';
    botao.textContent = 'Ler artigo completo';

    botao.addEventListener('click', function () {
      const aberto = secao.classList.toggle('expandido');
      botao.textContent = aberto ? 'Recolher artigo' : 'Ler artigo completo';
      if (!aberto) secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.recarregarPaineis) window.recarregarPaineis();
    });

    conteudo.appendChild(data);
    conteudo.appendChild(titulo);
    if (imagem) conteudo.appendChild(imagem);
    conteudo.appendChild(resumo);
    if ((dados.conteudo || '').trim() !== '') {
      conteudo.appendChild(corpo);
      conteudo.appendChild(botao);
    }
    secao.appendChild(conteudo);
    return secao;
  }

  async function carregarPublicacoes() {
    const status = document.getElementById('pub-status');
    const pilha = document.querySelector('#view-publicacoes .stack');
    if (!pilha) return;

    try {
      const consulta = query(
        collection(db, 'publicacoes'),
        where('publicado', '==', true),
        orderBy('data', 'desc')
      );
      const resultado = await getDocs(consulta);

      if (resultado.empty) {
        if (status) status.querySelector('p').textContent = 'Nenhuma publicação disponível no momento.';
        return;
      }

      if (status) status.remove();

      resultado.docs.forEach(function (doc, indice) {
        pilha.appendChild(criarPainel(doc.data(), indice));
      });

      if (window.recarregarPaineis) window.recarregarPaineis();
      if (window.ajustarFolhasAltas) window.ajustarFolhasAltas();
    } catch (erro) {
      console.error('Erro ao carregar publicações:', erro);
      if (status) status.querySelector('p').textContent = 'Não foi possível carregar as publicações agora.';
    }
  }

  carregarPublicacoes();

/* ======================================================
   NAVEGAÇÃO ENTRE VIEWS (Home, Publicações, Área do Cliente)
   ====================================================== */
(function () {
  'use strict';

  function navegarPara(telaId, atualizarHistorico) {
    if (atualizarHistorico === undefined) atualizarHistorico = true;

    // 0. Se já está nesta tela, apenas volta ao início dela
    var jaAtiva = document.getElementById('view-' + telaId);
    if (jaAtiva && !jaAtiva.classList.contains('hidden')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1. Esconde todas as views
    document.querySelectorAll('.view-section').forEach(function (secao) {
      secao.classList.add('hidden');
    });

    // 2. Remove o estado "active" de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(function (botao) {
      botao.classList.remove('active');
    });

    // 3. Mostra a view solicitada
    var secaoAlvo = document.getElementById('view-' + telaId);
    if (secaoAlvo) {
      secaoAlvo.classList.remove('hidden');
    }

    // 4. Marca o botão correspondente como ativo
    var btnAtivo = document.querySelector('.nav-btn[data-view="' + telaId + '"]');
    if (btnAtivo) {
      btnAtivo.classList.add('active');
    }

    // 5. Atualiza a URL (History API)
    if (atualizarHistorico && window.location.protocol !== 'file:') {
      try {
        var novaUrl = telaId === 'home' ? '/' : '/' + telaId;
        window.history.pushState({ tela: telaId }, '', novaUrl);
      } catch (erro) {
        /* ambiente não permite alterar a URL — segue normalmente */
      }
    }

    fecharMenuMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.recarregarPaineis) window.recarregarPaineis();
    if (window.ajustarFolhasAltas) window.ajustarFolhasAltas();

    var inicio = Date.now();
    (function acompanhar() {
      if (window.recarregarPaineis) window.recarregarPaineis();
      if (Date.now() - inicio < 900) window.requestAnimationFrame(acompanhar);
      else if (window.ajustarFolhasAltas) window.ajustarFolhasAltas();
    })();
  }

  function fecharMenuMobile() {
    var links = document.querySelector('.nav-links');
    var toggle = document.querySelector('.nav-toggle');
    if (links) links.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function alternarMenuMobile() {
    var links = document.querySelector('.nav-links');
    var toggle = document.querySelector('.nav-toggle');
    if (!links || !toggle) return;
    var aberto = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
  }

  window.addEventListener('DOMContentLoaded', function () {
    // Qualquer elemento com data-view navega (logo do menu + botões)
    document.querySelectorAll('[data-view]').forEach(function (el) {
      el.addEventListener('click', function () {
        navegarPara(el.getAttribute('data-view'));
      });
    });

    // Elementos com data-acao disparam a ação placeholder (CTA, login)
    document.querySelectorAll('[data-acao]').forEach(function (el) {
      el.addEventListener('click', function (evento) {
        evento.preventDefault();
        alert(el.getAttribute('data-acao'));
      });
    });

    // Troca a cor do menu conforme a seção por trás (preta = mistura, branca = verde sólido)
    var navEl = document.querySelector('nav');
    var secoesEscuras = document.querySelectorAll('.panel-hero, .panel-service.is-dark, .panel-cliente');
    var secoesClaras = document.querySelectorAll('.panel-service.is-light, .panel-pub-grid');

        var todosPaineis = document.querySelectorAll('.panel');

    window.recarregarPaineis = function () {
      todosPaineis = document.querySelectorAll('.panel');
      atualizarCorMenu();
    };

    function painelVisivelEm(meio) {
      var visivel = null;
      todosPaineis.forEach(function (secao) {
        if (secao.offsetParent === null) return;
        var retangulo = secao.getBoundingClientRect();
        if (retangulo.top <= meio && retangulo.bottom >= meio) visivel = secao;
      });
      return visivel;
    }
	
    // Balões de explicação das áreas de atuação (clique/toque abre e fecha, igual em qualquer aparelho)
    var badgesArea = document.querySelectorAll('.area-badge');

    function posicionarTooltip(item) {
      var tooltip = item.querySelector('.area-tooltip');
      var margem = 16;

      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%) translateY(0)';

      var retanguloTooltip = tooltip.getBoundingClientRect();
      var retanguloItem = item.getBoundingClientRect();
      var ajuste = 0;

      if (retanguloTooltip.left < margem) {
        ajuste = margem - retanguloTooltip.left;
      } else if (retanguloTooltip.right > window.innerWidth - margem) {
        ajuste = (window.innerWidth - margem) - retanguloTooltip.right;
      }

      if (ajuste !== 0) {
        tooltip.style.transform = 'translateX(calc(-50% + ' + ajuste + 'px)) translateY(0)';
      }
    }
	
	    // Folhas mais altas que a tela: prende pela base em vez do topo (celular)
    function ajustarFolhasAltas() {
      var folhasAltas = document.querySelectorAll('.panel-sobre, .panel-diferenciais, .panel-faq, .panel-artigo, .panel-pub-hero');
      var ehMobile = window.matchMedia('(max-width: 860px)').matches;
      var alturaTela = window.innerHeight;

      folhasAltas.forEach(function (secao) {
        if (!ehMobile) {
          secao.style.top = '';
          return;
        }
        var alturaSecao = secao.offsetHeight;
        secao.style.top = alturaSecao > alturaTela
          ? (alturaTela - alturaSecao) + 'px'
          : '0px';
      });
    }

    window.addEventListener('resize', ajustarFolhasAltas);
    window.addEventListener('orientationchange', ajustarFolhasAltas);
    window.addEventListener('load', ajustarFolhasAltas);

    document.querySelectorAll('.faq-item').forEach(function (item) {
      item.addEventListener('toggle', ajustarFolhasAltas);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(ajustarFolhasAltas);
    }

    window.ajustarFolhasAltas = ajustarFolhasAltas;
    ajustarFolhasAltas();

    function fecharTodasAreas() {
      document.querySelectorAll('.area-item.aberto').forEach(function (aberto) {
        aberto.classList.remove('aberto');
        aberto.querySelector('.area-badge').setAttribute('aria-expanded', 'false');
        aberto.querySelector('.area-tooltip').style.transform = '';
      });
    }

    badgesArea.forEach(function (botao) {
      var item = botao.closest('.area-item');

      botao.addEventListener('click', function (evento) {
        evento.stopPropagation();
        var jaAberto = item.classList.contains('aberto');
        fecharTodasAreas();
        if (!jaAberto) {
          item.classList.add('aberto');
          botao.setAttribute('aria-expanded', 'true');
          posicionarTooltip(item);
        }
      });
    });

    document.addEventListener('click', function (evento) {
      if (!evento.target.closest('.area-item')) {
        fecharTodasAreas();
      }
    });
	
	    // Popup de aviso da Área do Cliente
    var modal = document.getElementById('modal-aviso');
    var modalTexto = document.getElementById('modal-texto');
    var modalFechar = document.getElementById('modal-fechar');
    var btnEntrar = document.getElementById('btn-entrar');
    var campoDoc = document.getElementById('campo-doc');

    function abrirModal(texto) {
      if (!modal) return;
      modalTexto.textContent = texto;
      modal.classList.add('aberto');
    }

    function fecharModal() {
      if (modal) modal.classList.remove('aberto');
    }

    if (modalFechar) modalFechar.addEventListener('click', fecharModal);
    if (modal) {
      modal.addEventListener('click', function (evento) {
        if (evento.target === modal) fecharModal();
      });
    }
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') fecharModal();
    });

    if (btnEntrar) {
      btnEntrar.addEventListener('click', function (evento) {
        evento.preventDefault();
        var digitos = (campoDoc ? campoDoc.value : '').replace(/\D/g, '');

        if (digitos.length === 0) {
          abrirModal('Informe seu CPF ou CNPJ para acessar o sistema.');
        } else if (digitos.length === 11) {
          abrirModal('O CPF informado não foi localizado em nossa base de dados. Verifique os números digitados ou entre em contato com o escritório.');
        } else if (digitos.length === 14) {
          abrirModal('O CNPJ informado não foi localizado em nossa base de dados. Verifique os números digitados ou entre em contato com o escritório.');
        } else {
          abrirModal('O número informado não corresponde a um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
        }
      });
    }

    function atualizarCorMenu() {
      if (!navEl) return;
      var retanguloNav = navEl.getBoundingClientRect();
      var meio = retanguloNav.top + (retanguloNav.height / 2);
      var painel = painelVisivelEm(meio);

      var escuro = false;
      var claro = false;

      if (painel) {
        escuro = painel.matches('.panel-hero, .panel-service.is-dark, .panel-cliente');
        claro = painel.matches('.panel-service.is-light, .panel-pub-grid');
      }

      navEl.classList.toggle('nav-on-dark', escuro);
      navEl.classList.toggle('nav-on-light', claro);
    }

    if (navEl) {
      window.addEventListener('scroll', atualizarCorMenu, { passive: true });
      document.body.addEventListener('scroll', atualizarCorMenu, { passive: true });
      window.addEventListener('resize', atualizarCorMenu);
      atualizarCorMenu();
    }

    var consultaMobile = window.matchMedia('(max-width: 768px), (orientation: portrait)');
	
	    function centralizarNavMobile() {
      if (!navEl) return;
      var ehMobile = window.matchMedia('(max-width: 768px), (orientation: portrait)').matches;
      if (ehMobile) {
        var posicao = Math.round((window.innerWidth - navEl.offsetWidth) / 2);
        navEl.style.left = posicao + 'px';
        navEl.style.right = 'auto';
        navEl.style.marginLeft = '0';
        navEl.style.marginRight = '0';
      } else {
        navEl.style.left = '';
        navEl.style.right = '';
        navEl.style.marginLeft = '';
        navEl.style.marginRight = '';
      }
    }

        window.addEventListener('resize', centralizarNavMobile);
    window.addEventListener('orientationchange', centralizarNavMobile);
    centralizarNavMobile();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(centralizarNavMobile);
    }
    setTimeout(centralizarNavMobile, 500);

    var toggle = document.querySelector('.nav-toggle');
    if (toggle) toggle.addEventListener('click', alternarMenuMobile);

    // Acesso direto por URL (ex.: /cliente)
    var caminho = window.location.pathname.replace(/^\/|\/$/g, '');
    var telaInicial = (caminho === 'cliente' || caminho === 'publicacoes') ? caminho : 'home';
    navegarPara(telaInicial, false);
  });

  // Botões "voltar" / "avançar" do navegador
  window.addEventListener('popstate', function (evento) {
    if (evento.state && evento.state.tela) {
      navegarPara(evento.state.tela, false);
    } else {
      navegarPara('home', false);
    }
  });

  // Fecha o menu mobile se a tela for redimensionada para desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) fecharMenuMobile();
  });
})();
