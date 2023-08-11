import html from '../core.js'
import { connect } from '../store.js' // Lấy dữ liệu từ store ra
import Header from '../Component/Header.js'
import TodoList from '../Component/TodoList.js'
import Footer from '../Component/Footer.js'

function App({ todos }) {
    console.log(todos)
    return html`
        <section class="todoapp">
            ${Header()}
            ${todos.length > 0 && TodoList()}
            ${todos.length > 0 && Footer()}
        </section>
    `
}

export default connect()(App)