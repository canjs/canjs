import { Component, route, DefineMap, DefineList, realtimeRestModel } from "//unpkg.com/can@5/core.mjs";

const Message = DefineMap.extend("Message",{
	id: "number",
	name: "string",
	body: "string",
	created_at: "date"
});

Message.List = DefineList.extend("MessageList",{
	"#": Message
});

Message.connection = realtimeRestModel({
	url: {
		resource: 'https://chat.donejs.com/api/messages',
		contentType: 'application/x-www-form-urlencoded'
	},
	Map: Message,
	List: Message.List
});

Component.extend({
	tag: "chat-messages",
	view: `
		<h1 class="page-header text-center">
			Chat Messages
		</h1>
		<h5><a href="{{ routeUrl(page='home') }}">Home</a></h5>

		{{# if(this.messagesPromise.isPending) }}
			<div class="list-group-item list-group-item-info">
				<h4 class="list-group-item-heading">Loading…</h4>
			</div>
		{{/ if }}
		{{# if(this.messagesPromise.isRejected) }}
			<div class="list-group-item list-group-item-danger">
				<h4 class="list-group3-item-heading">Error</h4>
				<p class="list-group-item-text">{{ this.messagesPromise.reason }}</p>
			</div>
		{{/ if }}
		{{# if(this.messagesPromise.isResolved) }}
			{{# for(message of this.messagesPromise.value) }}
				<div class="list-group-item">
					<h4 class="list-group3--item-heading">{{ message.name }}</h4>
					<p class="list-group-item-text">{{ message.body }}</p>
				</div>
			{{ else }}
				<div class="list-group-item">
					<h4 class="list-group-item-heading">No messages</h4>
				</div>
			{{/ for }}
		{{/ if }}`,
	ViewModel: {
		// Properties
		messagesPromise: {
			default(){
				return Message.getList({});
			}
		}
	}
});

Component.extend({
	tag: "chat-app",
	view: `
		<div class="container">
			<div class="row">
			<div class="col-sm-8 col-sm-offset-2">
				{{# eq(this.routeData.page, 'home') }}
					<h1 class="page-header text-center" on:click="this.addExcitement()">
						{{ this.message }}
					</h1>
					<a href="{{ routeUrl(page='chat') }}"
					 class="btn btn-primary btn-block btn-lg">
						Start chat
					</a>
				{{ else }}
				 <chat-messages/>
				{{/ eq }}
			</div>
			</div>
		</div>`,
	ViewModel: {
		// Properties
		message: {
			type: "string",
			default: "Chat Home"
		},
		routeData: {
			default(){
				route.register("{page}",{page: "home"});
				route.start();
				return route.data;
			}
		},
		// Methods
		addExcitement(){
			this.message = this.message + "!";
		}
	}
});
