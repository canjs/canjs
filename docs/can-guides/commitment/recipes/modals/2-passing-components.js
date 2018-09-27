import { Component, value, stacheConverters, stache } from "//unpkg.com/can@5/ecosystem.mjs";
stache.addConverter(stacheConverters);

const OccupationQuestions = Component.extend({
	tag: "occupation-questions",
	view: `
		<h3>Occupation</h3>
		<div class='content'>
			<p>Are you a diva?
				<input type="radio" checked:bind="equal(isDiva, true)"/> yes
				<input type="radio"  checked:bind="equal(isDiva, false)"/> no
			</p>
			<p>Do you program?
				<input type="radio" checked:bind="equal(isProgrammer, true)"/> yes
				<input type="radio" checked:bind="equal(isProgrammer, false)"/> no
			</p>
			<p><button on:click="next()">Next</button></p>
		</div>
	`,
	ViewModel: {
		isDiva: "boolean",
		isProgrammer: "boolean"
	}
});

const DivaQuestions = Component.extend({
	tag: "diva-questions",
	view: `
		<h3>Diva Questions</h3>
		<div class='content'>
			<p>Check all expenses that apply:</p>
			<p><input type="checkbox"
					checked:bind="boolean-to-inList('Swagger', divaExpenses)"> Swagger
			</p>
			<p><input type="checkbox"
					checked:bind="boolean-to-inList('Fame', divaExpenses)"> Fame
			</p>
			<p><button on:click="next()">Next</button></p>
		</div>
    `,
    ViewModel: {
        divaExpenses: "any"
    }
});

const ProgrammerQuestions = Component.extend({
	tag: "programmer-questions",
	view: `
		<h3>Programmer Questions</h3>
		<div class='content'>
			<p>What is your favorite language?</p>
			<p>
				<select value:to="programmingLanguage">
					<option>C</option>
					<option>C++</option>
					<option>Java</option>
					<option>JavaScript</option>
				</select>
			</p>
			<p><button on:click="next()">Next</button></p>
		</div>
   `,
	ViewModel: {
		programmingLanguage: "string"
	}
});

const IncomeQuestions = Component.extend({
	tag: "income-questions",
	view: `
		<h3>Income</h3>
		<div class='content'>
			<p>What do you get paid in?</p>
			<p>
				<select value:bind="string-to-any(paymentType)">
					<option value="undefined">Select a type</option>
					<option>Peanuts</option>
					<option>Bread</option>
					<option>Tamales</option>
					<option>Cheddar</option>
					<option>Dough</option>
				</select>
			</p>
			<p><button on:click="next()">Finish</button></p>
		</div>
   `,
	ViewModel: {
		paymentType: "string"
	}
});

Component.extend({
	tag: "my-modals",
	view: `
		<div class='background'></div>
		<div class='modal-container'>
			{{ component }}
		</div>
	`
});

Component.extend({
	tag: "my-app",
	view: `
		<occupation-questions isDiva:bind="isDiva" isProgrammer:bind="isProgrammer"/>
		<p>isDiva: {{ isDiva }}</p>
		<p>isProgrammer: {{ isProgrammer }}</p>

		{{# if(isDiva) }}
			<my-modals component:from="divaQuestions"></my-modals>
		{{/ if }}
		<p>diva expenses: {{ divaExpenses.join(', ') }}</p>

		<programmer-questions programmingLanguage:bind="programmingLanguage"/>
		<p>programmingLanguage: {{ programmingLanguage }}</p>

		<income-questions paymentType:bind="paymentType"/>
		<p>paymentType: {{ paymentType }}</p>
   `,
	ViewModel: {
		// Stateful properties
		isDiva: { type: "boolean", default: false },
		divaExpenses: { Default: Array },
		isProgrammer: { type: "boolean", default: false },
		programmingLanguage: "string",
		paymentType: "string",

		divaQuestions: {
			default() {
				return new DivaQuestions({
					viewModel: {
						divaExpenses: value.bind(this, "divaExpenses")
					}
				});
			}
		},
		// Derived properties

		// Methods
	}
});
