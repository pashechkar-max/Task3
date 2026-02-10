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
    }
})