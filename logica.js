function navegarPara(telaId) {
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

            // 4. Marca o botão clicado como ativo (baseado no texto do botão)
            // Uma maneira simples de achar o botão clicado
            const btnClicado = Array.from(botoes).find(b => b.getAttribute('onclick').includes(telaId));
            if (btnClicado) {
                btnClicado.classList.add('active');
            }

            // 5. Rola a página para o topo suavemente
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
