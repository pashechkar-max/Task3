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
                Completed in time
            </span>
        </div>
    </div>
    `
})

Vue.component('board-column', {
    props: {
        title: String,
        task: Array,
        column: String
    },
    template: `
    <div class="column">
    <h2>{{ title }}</h2>
    
    <task-card
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
})