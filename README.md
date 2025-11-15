# Sistema Microfisioterapia
# Sumario (a fazer)
1. [Introdução](#Introdução)
	1. [Metodos utilizados](##Metodos utilizados)
2. [Objetivos](#Objetivos)
	1. [Geral](##Geral)
	2. [Especificos](##Especificos)
3. [Documento de requisitos](#Documento de requisitos)
	1. [Requisitos funcionais](##Requisitos funcionais)
		1. [RF1 - Cadastrar pacientes com dados pessoais e contato](###RF1 - Cadastrar pacientes com dados pessoais e contato)
		2. [RF2 - Registrar e armazenar anamnese digital](###RF2 - Registrar e armazenar anamnese digital)
		3. [RF3 - Consultar a agenda de consultas horários disponíveis e ocupados)](###RF3 - Consultar a agenda de consultas horários disponíveis e ocupados))
		4. [RF4 - Permitir o cancelamento e edição de consultas](###RF4 - Permitir o cancelamento e edição de consultas)
	2. [Requisitos não funcionais](##Requisitos não funcionais)
	3. [Requisitos de organização](##Requisitos de organização)
	4. [Requisitos de confiabilidade](##Requisitos de confiabilidade)
4. [Histórias do usúario](#Histórias do usúario)
5. [Casos de uso](#Casos de uso)
	1. [Cadastrar pacientes](##Cadastrar pacientes)
	2. [Registrar e armazenar anamnese digital](##Registrar e armazenar anamnese digital)
	3. [Consultar a agenda de consultas (horários disponíveis e ocupados)](##Consultar a agenda de consultas (horários disponíveis e ocupados))
	4. [Permitir o cancelamento e edição de consultas](##Permitir o cancelamento e edição de consultas)
6. [Diagrama de classes](#Diagrama de classes)
7. [Modelo de banco de dados](#Modelo de banco de dados)
8. [Estudo de viabilidade](## Estudo de viabilidade)
	1. [Viabilidade de mercado](##Viabilidade de mercado)
		1. [Demanda identificada](###Demanda identificada)
		2. [Diferenciais do site](###Diferenciais do site)
		3. [Concorrência](###Concorrência)
	2. [Viabilidade de recursos](##Viabilidade de recursos)
		1. [Recursos humanos](###Recursos humanos)
		2. [Ferramentas](###Ferramentas)
		3. [Infraestrutura tecnológica](###Infraestrutura tecnológica)
	3. [Viabilidade operacional](##Viabilidade operacional)
	4. [Conclusão do estudo de viabilidade](##Conclusão do estudo de viabilidade)
9. [Regra de negócio](#Regra de negócio)
	1. [Proposta de valor](##Proposta de valor)
	2. [Segmento de Clientes](Segmento de Clientes)
	3. [Canais de distribuição](##Canais de distribuição)
	4. [Relacionamento com clientes](##Relacionamento com clientes)
	5. [Atividades principais](##Atividades principais)
	6. [Parcerias principais](##Parcerias principais)
	7. [Recursos príncipais](##Recursos príncipais)
	8. [Estrutra de custos](##Estrutra de custos)
	9. [Fontes de receita](##Fontes de receita)
10. [Design](#Design)
	1. [Paleta de cores](##Paleta de cores)
	2. [Tipografia](##Tipografia)
	3. [Logo](##Logo)
	4. [Modelo de navegação](##Modelo de navegação)
	5. [Prototipo](##Prototipo)
11. [Considerações finais](#Considerações finais)
# Introdução
Devido ao cenário de atendimento a clínica de microfisioterapia, desenvolvemos esta solução para o auxilio e melhor atendimento dos pacientes, facilitar o registro de usuários e um método de agendamento para os pacientes que precisam de atendimento microfisioterapeuta. O foco deste projeto é um melhor o atendimento dos pacientes, garantir que os dados que serão registrados pelo médico estejam em segurança e sigilo, e um método mais prático de agendamento e consulta para os usuários. Dessa forma, busca-se maior organização, praticidade e acessibilidade para o profissional no acompanhamento dos pacientes.
## Metodos utilizados
As ferramentas e tecnologias utilizadas no projeto estão listadas a seguir.
- Tecnologias: HTML, CSS, JavaScript, C#
- Modelo de processo de desenvolvimento: Metodologia Ágil (Scrum), Prototipação.
- Cronograma: Definição de etapas do projeto e prazos específicos para cada fase (Planejamento, Design, Desenvolvimento, Testes, Implementação).
# Objetivos
## Geral
Desenvolver uma plataforma informativa e interativa que auxilie os pacientes que procuram por um profissional experiente na área, no caso o Dr. João Henrique Chacon, os informatizando sobre as técnicas utilizadas pelo mesmo, facilitando assim o meio de agendamento das consultas de usuários pelo sistema.
## Especificos
- Investigar ferramentas que auxiliem os usuários a registrar-se e agendar-se nas consultas.
- Criar e disponibilizar conteúdos educativos sobre a microfisioterapia e técnicas utilizadas durante o tratamento por meio da educação.
- Exibir uma página explicativa sobre a microfisioterapia.
- Proporcionar uma interface simples, responsiva e de fácil uso.
- Garantir acesso restrito às informações, preservando a privacidade dos pacientes.
# Documento de requisitos
Guia detalhado que define as necessidades e expectativas de um projeto de software. Ele especifica as funcionalidades, características e restrições que o sistema deve cumprir para atender aos objetivos do usuário final. Este documento serve como um acordo entre stakeholders, desenvolvedores e clientes, garantindo que todas as partes interessadas compreendam claramente o que o sistema deve realizar e quais critérios devem ser atendidos para sua implementação e sucesso. Essencialmente, ele atua como a base para o desenvolvimento, testes e manutenção do software, proporcionando um caminho claro e estruturado para a equipe de projeto.
## Requisitos funcionais
### RF1 - Cadastrar pacientes com dados pessoais e contato
O sistema deve permitir que usuários possam se cadastrar para que possam realizar o agendamento para consultar o profissional.
### RF2 - Registrar e armazenar anamnese digital
O sistema deve permitir que usuários possam se informar sobre o tratamento utilizado pelo profissional da área durante as consultas. Onde será possível ver os benefícios, custo de tratamento e da razão de realizar tal procedimento clínico.
### RF3 - Consultar a agenda de consultas horários disponíveis e ocupados)
O sistema deve permitir que usuários possam visualizar durante o agendamento, quais horários e dias estarão disponíveis para realizar uma consulta.
### RF4 - Permitir o cancelamento e edição de consultas
Com o usuário cadastrado e logado o sistema deve permitir que possa ser feita a edição do dia e hora da consulta e cancelamento de consultas.
## Requisitos não funcionais
- Usabilidade: A interface da aplicação deve ser intuitiva, fácil de navegar e acessível a todos os usuários.
- Performance: O tempo de carregamento das páginas deve ser rápido, garantindo que as informações sejam exibidas sem atrasos significativos.
- Compatibilidade: A aplicação deve ser compatível com os principais navegadores e dispositivos móveis, assegurando uma experiência consistente para todos os usuários.
- Segurança: A aplicação deve garantir a proteção dos dados dos usuários e ser resistente a ameaças como ataques cibernéticos.
## Requisitos de organização
- Manutenibilidade: O código da aplicação deve ser bem documentado e estruturado, facilitando futuras manutenções e atualizações.
- Escalabilidade: A aplicação deve ser capaz de crescer e suportar um aumento no número de usuários sem degradação de desempenho.
- Treinamento: Deve haver documentação e recursos disponíveis para treinar novos desenvolvedores e administradores da aplicação.
## Requisitos de confiabilidade
- Disponibilidade: A aplicação deve estar disponível pelo menos 99% do tempo, garantindo acesso contínuo e ininterrupto.
- Recuperação de falhas: A aplicação deve possuir mecanismos para recuperação rápida em caso de falhas, minimizando o tempo de inatividade.
- Consistência: Os dados apresentados devem ser precisos e atualizados, garantindo que os usuários recebam informações corretas.
# Histórias do usúario
- Como médico eu quero poder registrar as informações dos pacientes que atendo, onde eu possa alterar as informações conforme o andamento da consulta e excluir o paciente do registro.
- Como terapeuta, quero visualizar minha agenda para acompanhar os horários disponíveis.
# Casos de uso
## Cadastrar pacientes
- Atores: Usuario/Terapeuta
- Tipo: Primário.
- Descrição: Um Usuário acessa o website pela primeira vez e entra na página de registro. O Usuário preenche os dados necessários para registro e pressiona o botão de registrar. Quando termina, o Banco de Dados válida o registro, e caso não haja algum problema, armazenará as informações.
## Registrar e armazenar anamnese digital
- Atores: Usuario/Terapeuta
- Tipo: Primário.
- Descrição: O Profissional acessa o sistema e entra na página de registro para registrar a anamnese do Paciente/Usuário. O Profissional preenche os dados necessários para registro e pressiona o botão de registrar. Quando termina, o Banco de Dados valida o registro, e caso não haja nenhum problema, as informações da anamnese serão registradas.
## Consultar a agenda de consultas (horários disponíveis e ocupados)
- Atores: Usuario/Terapeuta
- Tipo: Primário
- Descrição: Um Usuário acessa o website após já ter cadastrado uma conta e entra na página de login. O Usuário pressiona um botão de marcar consulta, onde será mostrado os dias disponíveis e os horários disponíveis para marcar uma consulta com o Profissional.
## Permitir o cancelamento e edição de consultas
- Atores: Usuario/Terapeuta
- Tipo: Primário
- Descrição: Usuário, já cadastrado na plataforma, tem a opção realizar um agendamento de consulta com o profissional clínico. O Usuário após ter realizado o agendamento da consulta poderá cancelar o atendimento ou editar o dia e hora da consulta.
# Diagrama de classes
# !!!!! adicionar diagrama aqui !!!!!!
# Modelo de banco de dados
# !!!!!!!!!!! adicionar diagrama aqui !!!!!!!!!!!!!1
# Estudo de viabilidade
Há como objetivo analisar os aspectos técnicos, econômicos, operacionais legais e de mercado envolvidos do desenvolvimento da aplicação web. É uma forma de avaliar se o seu plano do projeto pode dar certo ou não, ou seja, verifica se é possível ou não avançar com ele.
## Viabilidade de mercado
Ela analisa a demanda potencial, o público-alvo e as oportunidades de mercado para a aplicação: a informatização sobre os tratamentos clínicos realizados, a possibilidade de agendamento de consultas e registrar a sua opinião após uma consulta realizada pelo profissional da área.
### Demanda identificada
Na cidade de Jau, foi visto que muitos pacientes clínicos buscam uma segunda alternativa, além da fisioterapia. Onde os pacientes necessitavam de uma plataforma que informasse sobre o método de tratamento utilizado na clínica e marcar um atendimento com o profissional da área.
### Diferenciais do site
Possibilidade de o usuário marcar consultas nos dias disponíveis e visualizar os feedbacks de outros usuários que já foram consultados.
### Concorrência
Originalmente não identificamos nenhum concorrente em potencial ou relevante.
## Viabilidade de recursos
Refere-se à análise dos insumos necessários para o desenvolvimento e manutenção da aplicação, avaliando sua disponibilidade e adequação. Durante a aplicação web, consideramos a necessidades de recursos humanos e ferramentas. Os recursos financeiros não foram levantados por se trata de um projeto educacional e não prevê a utilização de investimentos monetários.
### Recursos humanos
O desenvolvimento da plataforma será conduzido pelos próprios alunos, que também são os autores do trabalho.
### Ferramentas
Para o desenvolvimento do projeto foram utilizadas ferramentas gratuitas, como Visual Studio, GitHub e para a prototipação Figma.
### Infraestrutura tecnológica
As ferramentas tecnológicas contarão com os computadores e conexão à internet disponibilizada pela Fatec-Jahu.
## Viabilidade operacional
A viabilidade operacional do projeto envolveu a analisar as condições práticas para sua execução e manutenção ao longo do tempo. Considerado que o desenvolvimento do projeto será realizado por alunos da Fatec, os quais já possuem o conhecimento necessário para a execução do projeto, a operação do mesmo será realizada dentro do ambiente acadêmico. Onde os recursos tecnológicos, como computadores e internet da instituição, serão utilizados para o acesso contínuo para a progressão do desenvolvimento e a prototipação. O acompanhamento e gestão do processo do projeto serão feitos de forma colaborativa entre os membros da equipe, utilizando as plataformas como GitHub e Figma. Após a finalização do site, dependerá de manutenção periódica, com atualizações e ajustes conforme a necessidade.
## Conclusão do estudo de viabilidade
O estudo de viabilidade do projeto demonstrou que a plataforma é viável tanto tecnicamente quanto operacionalmente. A necessidade de haver uma plataforma que informatize sobre microfisioterapia, e seus benefícios, onde o usuário possa ser capaz de agendar consulta nos dias disponíveis, e ser possível para o médico especializado registrar o formulário dos pacientes, sendo possível edita-los e excluí-los de acordo com a consulta. A infraestrutura fornecida pela Fatec-Jahu e o uso de ferramentas gratuitas garantem a execução do projeto dentro dos recursos disponíveis. Além, de ser um projeto de natureza educacional, não exige investimentos financeiros. Resumindo o projeto, existem condições de ser desenvolvido e gerar um impacto positivo para os futuros usuários da cidade de Jahu.
# Regra de negócio
## Proposta de valor
Será desenvolvida uma plataforma informativa e interativa de atendimento clínico, promovendo a informatização da microfisioterapia e facilitando o agendamento de consultas de acordo com os sintomas dos usuários.
## Segmento de Clientes
Dr. João Henrique Chacon, consultórios e profissionais de microfisioterapia, pacientes, futuros terapeutas.
## Canais de distribuição
Mecanismos de buscas, Redes sociais.
## Relacionamento com clientes
O relacionamento com o usúario ocorrerá por agendamento de consultas.
## Atividades principais
Registro de consultas pelo médico clínico.
## Parcerias principais
Clinica do profissional Dr. João Henrique Chacon.
## Recursos príncipais
Hospedagem, computadores, desenvolvedores, internet.
## Estrutra de custos
Não haverá custos, pois o sistema será desenvolvido pelos alunos.
## Fontes de receita
Não haverá receita, pois é um projeto acadêmico.
# Design
## Paleta de cores
A paleta de cores foi escolhida com base nas cores que foram utilizadas no design da clinica.
# !!!! adicionar diagrama !!!!
## Tipografia
A família de fontes utilizada é "Nunito", Arial, Helvetica, sans-serif.
## Logo
O tipo de identidade visual da marca escolhido é logotipo, onde é usada pela clínica microfisioterapeuta do Dr. João Henrique Chacon.
# !!!! adicionar logo !!!!
## Modelo de navegação
# !!! adicionar diagrama !!!!
## Prototipo
Figma: [www.figma.com/design/RZThhBFPs1qPewubhhMgeO/PI-3-semestre?t=o5ZQYcXFgd21FyEB-0](http://www.figma.com/design/RZThhBFPs1qPewubhhMgeO/PI-3-semestre?t=o5ZQYcXFgd21FyEB-0)
# !!! adicionar diagrama !!!!
# Considerações finais
 No decorrer do desenvolvimento desse projeto tivemos alguns imprevistos, como a falta de conhecimento sobre a nova linguagem do terceiro semestre, sendo de grande ajuda posteriormente a readaptação e a integração de uma nova pessoa no grupo.

No geral, a fonte das dificuldades que enfrentamos ao desenvolver a aplicação foi a falta de conhecimento prévio da linguagem principal que tivemos que usar para criar o nosso website, visto que nenhum de nós havia tido experiência com ela anteriormente. No entanto, estamos superando essas dificuldades, com pesquisas e ajuda dos professores.

Desconsiderando a parte técnica do projeto, uma das maiores dificuldades, sem dúvidas, foi o tempo. Era desejado pela equipe adicionar mais coisas, porem devido alguns imprevistos pessoais nos membros da equipe, o projeto acabou não tendo todo o desempenho que, originalmente foi planejado realizar.

Por fim, cumprimos grande parte do que realmente queríamos e estamos satisfeitos com os resultados. Todos da equipe adquiriram conhecimentos necessário para futuros projetos, sendo essa aplicação apenas um dos muitos trabalhos que os membros poderão ter a chance de se orgulharem.
