// ==========================================
// ACADEMIC PLANNER
// ==========================================

let atividades = JSON.parse(
    localStorage.getItem("atividades")
) || [];


// ==========================================
// FORMATA DATA
// ==========================================

function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ==========================================
// CALCULA PRAZO
// ==========================================

function calcularPrazo(data) {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const prazo = new Date(
        data + "T00:00:00"
    );

    const diferenca = prazo - hoje;

    const dias = Math.ceil(
        diferenca /
        (1000 * 60 * 60 * 24)
    );


    if (dias < 0) {

        return {
            texto: `Atrasada há ${Math.abs(dias)} dia(s)`,
            classe: "atrasada"
        };

    }


    if (dias === 0) {

        return {
            texto: "Vence hoje",
            classe: "hoje"
        };

    }


    if (dias === 1) {

        return {
            texto: "Vence amanhã",
            classe: "amanha"
        };

    }


    return {
        texto: `Faltam ${dias} dias`,
        classe: "futuro"
    };

}


// ==========================================
// RESUMO DO DASHBOARD
// ==========================================

function atualizarResumo(lista) {

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    let pendentes = 0;
    let venceHoje = 0;
    let estaSemana = 0;


    lista.forEach((item) => {

        const prazo =
            new Date(
                item.data + "T00:00:00"
            );

        const diferenca =
            prazo - hoje;

        const dias =
            Math.ceil(
                diferenca /
                (1000 * 60 * 60 * 24)
            );


        // Pendentes
        if (!item.concluida && dias >= 0) {

            pendentes++;

        }


        // Vence hoje
        if (dias === 0) {

            venceHoje++;

        }


        // Próximos 7 dias
        if (dias >= 0 && dias <= 7) {

            estaSemana++;

        }

    });


    const pendentesElemento =
        document.getElementById(
            "totalPendentes"
        );

    const hojeElemento =
        document.getElementById(
            "venceHoje"
        );

    const semanaElemento =
        document.getElementById(
            "estaSemana"
        );


    if (pendentesElemento) {

        pendentesElemento.textContent =
            pendentes;

    }


    if (hojeElemento) {

        hojeElemento.textContent =
            venceHoje;

    }


    if (semanaElemento) {

        semanaElemento.textContent =
            estaSemana;

    }

}


// ==========================================
// MOSTRAR ATIVIDADES
// ==========================================

function mostrarAtividades(lista = atividades) {

    const elemento =
        document.getElementById(
            "listaAtividades"
        );


    if (!elemento) return;


    elemento.innerHTML = "";


    atualizarResumo(lista);


    if (lista.length === 0) {

        elemento.innerHTML =
            "<p>Nenhuma atividade encontrada.</p>";

        return;

    }


    lista.forEach((item) => {

        const prazo =
            calcularPrazo(item.data);


        const div =
            document.createElement("div");


        div.className =
            "atividade";


        div.innerHTML = `

            <h3>
                ${item.materia || "UNIVESP"}
            </h3>

            <p>
                ${item.atividade || item.titulo}
            </p>

            <p>
                Prazo:
                <strong>
                    ${formatarData(item.data)}
                </strong>
            </p>

            <p class="status ${prazo.classe}">
                ${prazo.texto}
            </p>

            ${
                item.origem !== "AVA"
                ?
                `
                <br>

                <button
                    onclick="concluirAtividade(${item.id})"
                >
                    ${
                        item.concluida
                        ? "Desmarcar"
                        : "Concluir"
                    }
                </button>

                <button
                    onclick="excluirAtividade(${item.id})"
                >
                    Excluir
                </button>
                `
                :
                ""
            }

            <hr>

        `;


        elemento.appendChild(div);

    });

}


// ==========================================
// ADICIONAR ATIVIDADE MANUAL
// ==========================================

function adicionarAtividade() {

    const materia =
        document.getElementById(
            "materia"
        ).value;

    const atividade =
        document.getElementById(
            "atividade"
        ).value;

    const data =
        document.getElementById(
            "data"
        ).value;


    if (
        materia === "" ||
        atividade === "" ||
        data === ""
    ) {

        alert(
            "Preencha todos os campos!"
        );

        return;

    }


    const novaAtividade = {

        id: Date.now(),

        materia: materia,

        atividade: atividade,

        data: data,

        concluida: false,

        origem: "manual"

    };


    atividades.push(
        novaAtividade
    );


    salvarAtividades();

    mostrarAtividades();


    document.getElementById(
        "materia"
    ).value = "";


    document.getElementById(
        "atividade"
    ).value = "";


    document.getElementById(
        "data"
    ).value = "";

}


// ==========================================
// SALVAR
// ==========================================

function salvarAtividades() {

    localStorage.setItem(
        "atividades",
        JSON.stringify(
            atividades
        )
    );

}


// ==========================================
// CONCLUIR
// ==========================================

function concluirAtividade(id) {

    const atividade =
        atividades.find(
            item => item.id === id
        );


    if (atividade) {

        atividade.concluida =
            !atividade.concluida;

    }


    salvarAtividades();

    mostrarAtividades();

}


// ==========================================
// EXCLUIR
// ==========================================

function excluirAtividade(id) {

    atividades =
        atividades.filter(
            item => item.id !== id
        );


    salvarAtividades();

    mostrarAtividades();

}


// ==========================================
// BUSCAR ATIVIDADES DO AVA
// ==========================================

async function carregarAtividadesDoAVA() {

    try {

        const resposta =
            await fetch(
                "http://127.0.0.1:5000/api/atividades"
            );


        const atividadesAVA =
            await resposta.json();


        if (atividadesAVA.erro) {

            console.error(
                "Erro ao carregar atividades:",
                atividadesAVA.erro
            );

            return;

        }


        console.log(
            "Atividades recebidas do AVA:",
            atividadesAVA
        );


        const atividadesImportadas =
            atividadesAVA.map(
                (item, index) => {

                    return {

                        id:
                            `ava-${index}`,

                        titulo:
                            item.titulo,

                        atividade:
                            item.titulo,

                        materia:
                            "UNIVESP",

                        data:
                            item.data,

                        origem:
                            "AVA",

                        concluida:
                            false

                    };

                }
            );


        mostrarAtividades(
            atividadesImportadas
        );


    } catch (erro) {

        console.error(
            "Não foi possível conectar ao backend:",
            erro
        );

    }

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

mostrarAtividades();

carregarAtividadesDoAVA();
// ==========================================
// NOTIFICAÇÕES
// ==========================================

async function pedirPermissaoNotificacao() {

    if (!("Notification" in window)) {

        console.log(
            "Este navegador não suporta notificações."
        );

        return;

    }

    if (Notification.permission === "default") {

        await Notification.requestPermission();

    }

}


// Inicia as notificações
pedirPermissaoNotificacao();
function verificarNotificacoes() {

    if (Notification.permission !== "granted") {
        return;
    }

    fetch("http://127.0.0.1:5000/api/atividades")
        .then(resposta => resposta.json())
        .then(atividadesAVA => {

            const hoje = new Date();

            hoje.setHours(0, 0, 0, 0);

            atividadesAVA.forEach((item, index) => {

                const prazo =
                    new Date(item.data + "T00:00:00");

                const diferenca =
                    prazo - hoje;

                const dias = Math.ceil(
                    diferenca /
                    (1000 * 60 * 60 * 24)
                );


                // Só avisa para atividades
                // que vencem hoje ou amanhã

                if (dias === 0 || dias === 1) {

                    const chave =
                        `notificacao-${index}-${item.data}`;

                    const jaNotificou =
                        localStorage.getItem(chave);


                    if (!jaNotificou) {

                        let mensagem;


                        if (dias === 0) {

                            mensagem =
                                "Uma atividade vence hoje.";

                        } else {

                            mensagem =
                                "Uma atividade vence amanhã.";

                        }


                        new Notification(
                            "Academic Planner",
                            {
                                body:
                                    `${item.titulo}\n${mensagem}`,
                                icon:
                                    "/favicon.ico"
                            }
                        );


                        localStorage.setItem(
                            chave,
                            "true"
                        );

                    }

                }

            });

        })
        .catch(erro => {

            console.error(
                "Erro ao verificar notificações:",
                erro
            );

        });

}verificarNotificacoes();