📦GestionDeEspacios
 ┣ 📂BACKEND
 ┃ ┣ 📂src
 ┃ ┃ ┣ 📂domain
 ┃ ┃ ┃ ┣ 📂interfaces
 ┃ ┃ ┃ ┃ ┗ 📜Acciones.ts
 ┃ ┃ ┃ ┣ 📂repositories
 ┃ ┃ ┃ ┃ ┣ 📜IAdministrador.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜IEspacio.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜IReserva.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜ISuperAdmin.repository.ts
 ┃ ┃ ┃ ┃ ┗ 📜IUsuario.repository.ts
 ┃ ┃ ┃ ┣ 📜Administrador.ts
 ┃ ┃ ┃ ┣ 📜Espacio.ts
 ┃ ┃ ┃ ┣ 📜Persona.ts
 ┃ ┃ ┃ ┣ 📜Reserva.ts
 ┃ ┃ ┃ ┣ 📜SuperAdmin.ts
 ┃ ┃ ┃ ┣ 📜Usuario.ts
 ┃ ┃ ┃ ┗ 📜utils.ts
 ┃ ┃ ┣ 📂infrastructure
 ┃ ┃ ┃ ┣ 📂controllers
 ┃ ┃ ┃ ┃ ┣ 📜Administrador.controller.ts
 ┃ ┃ ┃ ┃ ┗ 📜Espacio.controller.ts
 ┃ ┃ ┃ ┣ 📂database
 ┃ ┃ ┃ ┃ ┗ 📜connection.ts
 ┃ ┃ ┃ ┣ 📂db
 ┃ ┃ ┃ ┃ ┗ 📜mongo.ts
 ┃ ┃ ┃ ┣ 📂middleware
 ┃ ┃ ┃ ┃ ┗ 📜session.ts
 ┃ ┃ ┃ ┣ 📂models
 ┃ ┃ ┃ ┃ ┣ 📜Administrador.model.ts
 ┃ ┃ ┃ ┃ ┣ 📜Espacio.model.ts
 ┃ ┃ ┃ ┃ ┣ 📜index.ts
 ┃ ┃ ┃ ┃ ┣ 📜Reserva.model.ts
 ┃ ┃ ┃ ┃ ┣ 📜SuperAdmin.model.ts
 ┃ ┃ ┃ ┃ ┗ 📜Usuario.model.ts
 ┃ ┃ ┃ ┣ 📂repositories
 ┃ ┃ ┃ ┃ ┣ 📜Administrador.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜Espacio.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜index.ts
 ┃ ┃ ┃ ┃ ┣ 📜Reserva.repository.ts
 ┃ ┃ ┃ ┃ ┣ 📜SuperAdmin.repository.ts
 ┃ ┃ ┃ ┃ ┗ 📜Usuario.repository.ts
 ┃ ┃ ┃ ┣ 📂routes
 ┃ ┃ ┃ ┃ ┣ 📜administrador.routes.ts
 ┃ ┃ ┃ ┃ ┣ 📜auth.routes.ts
 ┃ ┃ ┃ ┃ ┣ 📜espacio.routes.ts
 ┃ ┃ ┃ ┃ ┣ 📜index.ts
 ┃ ┃ ┃ ┃ ┣ 📜reserva.routes.ts
 ┃ ┃ ┃ ┃ ┣ 📜superadmin.routes.ts
 ┃ ┃ ┃ ┃ ┗ 📜usuario.routes.ts
 ┃ ┃ ┃ ┗ 📂utils
 ┃ ┃ ┃ ┃ ┣ 📜bcrypt.handle.ts
 ┃ ┃ ┃ ┃ ┗ 📜jwt.handle.ts
 ┃ ┃ ┗ 📜app.ts
 ┃ ┣ 📜.env
 ┃ ┣ 📜.gitignore
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜pnpm-lock.yaml
 ┃ ┣ 📜README.md
 ┃ ┗ 📜tsconfig.json
 ┣ 📂FRONTEND
 ┃ ┣ 📂public
 ┃ ┃ ┣ 📜LogoIsoft.png
 ┃ ┃ ┗ 📜vite.svg
 ┃ ┣ 📂src
 ┃ ┃ ┣ 📂api
 ┃ ┃ ┃ ┣ 📂services
 ┃ ┃ ┃ ┃ ┣ 📜administradores.service.js
 ┃ ┃ ┃ ┃ ┣ 📜espacios.service.js
 ┃ ┃ ┃ ┃ ┗ 📜usuarios.service.js
 ┃ ┃ ┃ ┣ 📜AuthToken.js
 ┃ ┃ ┃ ┣ 📜axios.js
 ┃ ┃ ┃ ┗ 📜services.js
 ┃ ┃ ┣ 📂assets
 ┃ ┃ ┃ ┣ 📜calendar-icon.svg
 ┃ ┃ ┃ ┣ 📜classroom-icon.svg
 ┃ ┃ ┃ ┣ 📜home-icon.svg
 ┃ ┃ ┃ ┣ 📜logoIa.png
 ┃ ┃ ┃ ┣ 📜LogoIsoft.png
 ┃ ┃ ┃ ┗ 📜react.svg
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂Dashboard
 ┃ ┃ ┃ ┃ ┗ 📜Sidebar.jsx
 ┃ ┃ ┃ ┣ 📂Layout
 ┃ ┃ ┃ ┃ ┗ 📜DashboardLayout.jsx
 ┃ ┃ ┃ ┣ 📂modal
 ┃ ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┃ ┣ 📜Modal.jsx
 ┃ ┃ ┃ ┃ ┗ 📜ModalAlert.jsx
 ┃ ┃ ┃ ┣ 📂popover
 ┃ ┃ ┃ ┃ ┣ 📜index.js
 ┃ ┃ ┃ ┃ ┣ 📜Popover.jsx
 ┃ ┃ ┃ ┃ ┣ 📜PopoverContent.jsx
 ┃ ┃ ┃ ┃ ┗ 📜PopoverHandler.jsx
 ┃ ┃ ┃ ┣ 📂table
 ┃ ┃ ┃ ┃ ┣ 📜Col.jsx
 ┃ ┃ ┃ ┃ ┣ 📜ColHead.jsx
 ┃ ┃ ┃ ┃ ┣ 📜Paginate.jsx
 ┃ ┃ ┃ ┃ ┣ 📜Row.jsx
 ┃ ┃ ┃ ┃ ┣ 📜Table.jsx
 ┃ ┃ ┃ ┃ ┗ 📜TableHead.jsx
 ┃ ┃ ┃ ┣ 📜Header.jsx
 ┃ ┃ ┃ ┣ 📜Icons.jsx
 ┃ ┃ ┃ ┣ 📜Info.jsx
 ┃ ┃ ┃ ┣ 📜Menu.jsx
 ┃ ┃ ┃ ┗ 📜MenuDropdown.jsx
 ┃ ┃ ┣ 📂context
 ┃ ┃ ┃ ┗ 📂Auth
 ┃ ┃ ┃ ┃ ┣ 📜SessionContext.jsx
 ┃ ┃ ┃ ┃ ┣ 📜SessionState.jsx
 ┃ ┃ ┃ ┃ ┗ 📜useSession.jsx
 ┃ ┃ ┣ 📂hooks
 ┃ ┃ ┃ ┣ 📜useAlertMessage.jsx
 ┃ ┃ ┃ ┣ 📜useControlModal.jsx
 ┃ ┃ ┃ ┗ 📜useFocusOut.jsx
 ┃ ┃ ┣ 📂pages
 ┃ ┃ ┃ ┣ 📜ConsultaEspacios.jsx
 ┃ ┃ ┃ ┣ 📜Dashboard.jsx
 ┃ ┃ ┃ ┣ 📜GestionAdministradores.jsx
 ┃ ┃ ┃ ┣ 📜GestionEspacios.jsx
 ┃ ┃ ┃ ┣ 📜GestionUsuarios.jsx
 ┃ ┃ ┃ ┣ 📜Inicio.jsx
 ┃ ┃ ┃ ┣ 📜login.jsx
 ┃ ┃ ┃ ┣ 📜Perfil.jsx
 ┃ ┃ ┃ ┣ 📜Portada.jsx
 ┃ ┃ ┃ ┗ 📜register.jsx
 ┃ ┃ ┣ 📂routes
 ┃ ┃ ┃ ┣ 📜LoadComponents.jsx
 ┃ ┃ ┃ ┗ 📜routes.jsx
 ┃ ┃ ┣ 📂tools
 ┃ ┃ ┃ ┣ 📜CONSTANTS.jsx
 ┃ ┃ ┃ ┣ 📜Types.jsx
 ┃ ┃ ┃ ┗ 📜utils.js
 ┃ ┃ ┣ 📜App.css
 ┃ ┃ ┣ 📜App.jsx
 ┃ ┃ ┣ 📜index.css
 ┃ ┃ ┗ 📜main.jsx
 ┃ ┣ 📜.env
 ┃ ┣ 📜.gitignore
 ┃ ┣ 📜eslint.config.js
 ┃ ┣ 📜index.html
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜postcss.config.js
 ┃ ┣ 📜README.md
 ┃ ┣ 📜tailwind.config.js
 ┃ ┗ 📜vite.config.js
 ┣ 📜bloqueA.json
 ┣ 📜bloqueB.json
 ┣ 📜bloqueC.json
 ┗ 📜README.md