Vue.component('task-card', {
    props: {
        task: Object,
        column: String
    },

    methods: {
        editTask(){
            this.$emit('edit', this.task);
        },
        moveForward(){
            this.$emit('move-forward', this.task);
        },
        moveBack(){
            const reason = prompt('Please indicate the reason for return');
            if(!reason) return
            this.$emit('move-back', { task: this.task, reason });
        }
    },

    template: `
    <div class="card">
        <h3>{{ task.title }}</h3>

        <p>{{ task.description }}</p>

        <small>
            created: {{ task.createdAt }} <br>
            updated: {{ task.updatedAt }} <br>
            deadline: {{ task.deadline }}
        </small>

        <p v-if="task.returnReason">
            <b>Reason for return:</b> {{ task.returnReason }}
        </p>

        <div class="actions">
            <button @click="editTask">Edit</button>

            <button 
                v-if="column !== 'done'" 
                @click="moveForward"
            >
                >
            </button>

            <button 
                v-if="column === 'testing'" 
                @click="moveBack"
            >
                < Return
            </button>

            <button 
                v-if="column === 'todo'"
                id="delete" 
                @click="$emit('delete', task)">
                Delete
            </button>

            <span 
                v-if="task.status !== 'done' && new Date() > new Date(task.deadlineRaw)"
                class="overdue">
                Overdue
            </span>

            <span v-if="task.isCompletedInTime" class="ok">
                Completed in time!
            </span>
        </div>
    </div>
    `
})

Vue.component('board-column', {
    props: {
        title: String,
        tasks: Array,
        column: String
    },
    template: `
    <div class="column">
    <h2>{{ title }}</h2>
    
    <task-card class="task-card"
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :column="column"
        @delete="$emit('delete', $event)"
        @edit="$emit('edit', $event)"
        @move-forward="$emit('move-forward', $event)"
        @move-back="$emit('move-back', $event)"
    ></task-card>
    </div>
    `
})

Vue.component('create-task', {
    data() {
        return {
            title: '',
            description: '',
            deadline: ''
        }
    },
    methods:{
        create(){
            if (!this.title || !this.deadline) return
            const now = new Date().toLocaleString('ru-RU')

            const task = {
                id: Date.now(),
                title: this.title,
                description: this.description,
                createdAt: now,
                updatedAt: now,
                deadline: new Date(this.deadline).toLocaleString('ru-RU'),
                deadlineRaw: this.deadline,
                status: 'todo',
                returnReason: null,
                isCompletedInTime: false
            }

            this.$emit('create', task);

            this.title = ''
            this.description = ''
            this.deadline = ''

        }
    },
    template: `
<div class="start">
    <div class="start-text">
    <h1>TASK3</h1>
    <p>
        A web application for managing notes.<br>
    </p>
    <p>
     Supports creating, editing,
        and moving tasks between stages
        with deadline control and data saving.
</p>
</div>
    <div class="create-task">
    <h2>Create your note</h2>
    <input v-model="title" placeholder="title">
    <textarea v-model="description" placeholder="description"></textarea>
    <input type="date" v-model="deadline">
    
    <button class="create" @click="create">Create</button>
    </div>
</div>
`
})

Vue.component('board-now-vue', {
    props: {
        columns: Object
    },

    template: `
    <div class="columns">
        <board-column
                title="To Do >>>"
                column="todo"
                :tasks="columns.todo"
                @edit="editTask"
                @move-forward="moveForward"
                @delete="deleteTask"
        ></board-column>

        <board-column
                title="In Progress >>"
                column="inProgress"
                :tasks="columns.inProgress"
                @edit="editTask"
                @move-forward="moveForward"

        ></board-column>

        <board-column
                title="Testing >"
                column="testing"
                :tasks="columns.testing"
                @edit="editTask"
                @move-forward="moveForward"
                @move-back="moveBack"
        ></board-column>

        <board-column
                title="Done ."
                column="done"
                :tasks="columns.done"
        ></board-column>
    </div>
    `
})

new Vue({
    el: '#app',
    data: {
        columns: {
            todo: [],
            inProgress: [],
            testing: [],
            done: []
        }
    },
    methods: {
        addTask(task){
            this.columns.todo.push(task)
            this.save()
        },

        editTask(task){

            const isOverdue =
                task.status !== 'done' &&
                new Date() > new Date(task.deadlineRaw)

            if (isOverdue) {
                alert('The date of overdue notes cannot be changed')
                return
            }

            const title = prompt('New title', task.title)
            if (title) {
                task.title = title
            }

            const newDeadline = prompt('New deadline', task.deadlineRaw)
            if (newDeadline) {
                task.deadlineRaw = newDeadline
                task.deadline = new Date(newDeadline).toLocaleString('ru-RU')
            }

            task.updatedAt = new Date().toLocaleString('ru-RU')
            this.save()
        },

        deleteTask(task) {
            this.columns[task.status] =
                this.columns[task.status].filter(t => t.id !== task.id)
            this.save()
        },

        finishTask(task) {
            const deadline = new Date(task.deadlineRaw)
            const now = new Date()
            task.isCompletedInTime = now <= deadline
            task.returnReason = null
            this.move(task, 'testing', 'done')
        },

        moveForward(task) {
            if (task.status === 'todo'){
                this.move(task, 'todo', 'inProgress')
            }
            else if (task.status === 'inProgress'){
                this.move(task, 'inProgress', 'testing')
            }
            else if (task.status === 'testing'){
                this.finishTask(task)
            }
        },

        moveBack({ task, reason }) {
            task.returnReason = reason
            this.move(task, 'testing', 'inProgress')
        },

        move(task, from, to) {
            this.columns[from] = this.columns[from].filter(t => t.id !== task.id)
            task.status = to
            task.updatedAt = new Date().toLocaleString('ru-RU')
            this.columns[to].push(task)
            this.save()
        },

        save() {
            localStorage.setItem('kanban', JSON.stringify(this.columns))
        },

        load() {
            const data = localStorage.getItem('kanban')
            if (data) this.columns = JSON.parse(data)
        }
    },

    mounted() {
        this.load()
    }
    // ждем
})