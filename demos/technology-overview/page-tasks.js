import { StacheElement, type } from "can";
import "./percent-slider";

class TaskEditor extends StacheElement {
	static get view() {
		return `
			{{# if(this.logout) }}
				<h1><code>&lt;task-editor&gt;</code></h1>
				<p>
					This content is provided by the <code>&lt;task-editor&gt;</code> component.
					Click <a href="{{ routeUrl(page='home') }}">Home</a> to return to the homepage, or
					<button on:click="this.logout()">Logout</button> to log out. Edit the task below:
				</p>
			{{ else }}
				<h2>Task Editor</h2>
			{{/ if }}

			<form on:submit="this.save(scope.event)">
				Name: {{ this.name }}
				<p>
					<input value:bind="this.name">
				</p>
				Progress: {{ this.progress }}
				<p>
					<percent-slider value:bind="this.progress" />
				</p>
				<button disabled:from="this.isSaving">
					{{# if(this.isSaving) }}Saving{{ else }}Save{{/ if }}
				</button>
			</form>
		`;
	}

	static get props() {
		return {
			id: type.convert(Number),

			name: {
				get default() {
					return "Task " + this.id;
				}
			},

			progress: {
				// makes progress an integer
				type(num) {
					return parseInt(num, 10);
				},
				default: 0
			},

			isSaving: { default: false }
		};
	}

	save(event) {
		event.preventDefault();
		this.isSaving = true;
		// fake ajax request
		setTimeout(() => {
			this.isSaving = false;
		}, 2000);
	}
}

customElements.define("task-editor", TaskEditor);

export default TaskEditor;
