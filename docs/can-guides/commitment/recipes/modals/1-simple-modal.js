import {
	stache,
	stacheConverters,
	StacheElement,
	type,
	ObservableArray
} from "//unpkg.com/can@6/ecosystem.mjs";

stache.addConverter(stacheConverters);

class OccupationQuestions extends StacheElement {
	static view = `
		<h3>Occupation</h3>
		<div class="content">
			<p>
				Are you a diva?
				<input id="diva-yes" type="radio" checked:bind="equal(this.isDiva, true)">
				<label for="diva-yes">yes</label>

				<input id="diva-no" type="radio" checked:bind="equal(this.isDiva, false)">
				<label for="diva-no">no</label>
			</p>
			<p>
			Do you program?
				<input
					id="programmer-yes"
					type="radio"
					checked:bind="equal(this.isProgrammer, true)"
				>
				<label for="programmer-yes">yes</label>

				<input
					id="programmer-no"
					type="radio"
					checked:bind="equal(this.isProgrammer, false)"
				>
				<label for="programmer-no">no</label>
			</p>
			<p><button on:click="this.next()">Next</button></p>
		</div>
	`;

	static props = {
		isDiva: Boolean,
		isProgrammer: Boolean
	};
}

customElements.define("occupation-questions", OccupationQuestions);

class DivaQuestions extends StacheElement {
	static view = `
		<h3>Diva Questions</h3>
		<div class="content">
			<p>Check all expenses that apply:</p>
			<p>
				<input
					id="swagger"
					type="checkbox"
					checked:bind="boolean-to-inList('Swagger', this.divaExpenses)"
				>
				<label for="swagger">Swagger</label>
			</p>
			<p>
				<input
					id="fame"
					type="checkbox"
					checked:bind="boolean-to-inList('Fame', this.divaExpenses)"
				>
				<label for="fame">Fame</label>
			</p>
			<p><button on:click="this.next()">Next</button></p>
		</div>
	`;

	static props = {
		divaExpenses: type.Any
	};
}

customElements.define("diva-questions", DivaQuestions);

class ProgrammerQuestions extends StacheElement {
	static view = `
		<h3>Programmer Questions</h3>
		<div class="content">
			<p>What is your favorite language?</p>
			<p>
				<select value:to="this.programmingLanguage">
					<option>C</option>
					<option>C++</option>
					<option>Java</option>
					<option>JavaScript</option>
				</select>
			</p>
			<p><button on:click="this.next()">Next</button></p>
		</div>
	`;

	static props = {
		programmingLanguage: String
	};
}

customElements.define("programmer-questions", ProgrammerQuestions);

class IncomeQuestions extends StacheElement {
	static view = `
		<h3>Income</h3>
		<div class="content">
			<p>What do you get paid in?</p>
			<p>
				<select value:bind="string-to-any(this.paymentType)">
					<option value="undefined">Select a type</option>
					<option>Peanuts</option>
					<option>Bread</option>
					<option>Tamales</option>
					<option>Cheddar</option>
					<option>Dough</option>
				</select>
			</p>
			<p><button on:click="this.next()">Finish</button></p>
		</div>
	`;

	static props = {
		paymentType: type.maybeConvert(String)
	};
}

customElements.define("income-questions", IncomeQuestions);

class MyModals extends StacheElement {
	static view = `
		<div class="background"></div>
		<div class="modal-container">
			<content>Supply some content</content>
		</div>
	`;
}

customElements.define("my-modals", MyModals);

class MyApp extends StacheElement {
	static view = `
		<occupation-questions 
			isDiva:bind="this.isDiva"
			isProgrammer:bind="this.isProgrammer"
		/>
		<p>isDiva: {{ this.isDiva }}</p>
		<p>isProgrammer: {{ this.isProgrammer }}</p>

		{{# if(this.isDiva) }}
			<my-modals>
				<diva-questions divaExpenses:bind="this.divaExpenses" />
			</my-modals>
		{{/ if }}
		<p>diva expenses: {{ this.divaExpenses.join(', ') }}</p>

		<programmer-questions programmingLanguage:bind="this.programmingLanguage" />
		<p>programmingLanguage: {{ this.programmingLanguage }}</p>

		<income-questions paymentType:bind="this.paymentType" />
		<p>paymentType: {{ this.paymentType }}</p>
	`;

	static props = {
		// Stateful properties
		isDiva: false,

		divaExpenses: {
			get default() {
				return new ObservableArray();
			}
		},

		isProgrammer: false,
		programmingLanguage: String,
		paymentType: String

		// Derived properties
	};

	// Methods
}

customElements.define("my-app", MyApp);
