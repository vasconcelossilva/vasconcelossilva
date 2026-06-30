function navegarPara(telaId, atualizarHistorico = true) {
            // 1. Esconde todas as seções
            const secoes = document.querySelectorAll('.view-section');
            secoes.forEach(secao => {
                secao.classList.add('hidden');
            });

            // 2. Remove a classe 'active' de todos os botões de navegação
            const botoes = document.querySelectorAll('.nav-btn');
            botoes.forEach(botao => {
                botao.classList.remove('active');
            });

            // 3. Mostra a seção solicitada
            const secaoAlvo = document.getElementById('view-' + telaId);
            if (secaoAlvo) {
                secaoAlvo.classList.remove('hidden');
            }

            // 4. Marca o botão clicado como ativo
            const btnClicado = Array.from(botoes).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(telaId));
            if (btnClicado) {
                btnClicado.classList.add('active');
            }

            // 5. Atualiza a URL na barra do navegador (History API)
            if (atualizarHistorico) {
                const novaUrl = telaId === 'home' ? '/' : '/' + telaId;
                window.history.pushState({ tela: telaId }, '', novaUrl);
            }

            // 6. Rola a página para o topo suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Lida com o acesso direto por link (Ex: colar /cliente direto no navegador)
        window.addEventListener('DOMContentLoaded', () => {
            const caminho = window.location.pathname.replace(/^\/|\/$/g, ''); // Pega o caminho sem barras
            const telaInicial = (caminho === 'cliente' || caminho === 'publicacoes') ? caminho : 'home';
            
            // Inicia na tela correta sem empurrar um novo histórico
            navegarPara(telaInicial, false);
        });

        // Permite que o botão de "Voltar" e "Avançar" do navegador funcionem
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.tela) {
                navegarPara(event.state.tela, false);
            } else {
                navegarPara('home', false);
            }
        });
