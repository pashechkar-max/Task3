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
            Created: {{ task.createdAt }} <br>
            Updated: {{ task.updatedAt }} <br>
            Deadline: {{ task.deadline }}
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
                ->
            </button>

            <button 
                v-if="column === 'testing'" 
                @click="moveBack"
            >
                <- Return
            </button>

            <span v-if="task.isOverdue" class="overdue">
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
            const now = new Date().toLocaleDateString('ru-RU');

            const task = {
                id: Date.now(),
                title: this.title,
                description: this.description,
                createdAt: now,
                updatedAt: now,
                deadline: new Date(this.deadline).toLocaleDateString('ru-RU'),
                status: 'todo',
                returnReason: null,
                isOverdue: false,
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
            const title = prompt('New title', task.title)
            if (title) {
                task.title = title
                task.updatedAt = new Date().toLocaleDateString('ru-RU')
                this.save()
            }
        },

        finishTask(task) {
            const deadline = new Date(task.deadline)
            const now = new Date()

            task.isOverdue = now > deadline
            task.isCompletedInTime = now <= deadline

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
            task.updatedAt = new Date().toLocaleDateString('ru-RU')
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