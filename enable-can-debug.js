import { default as debug } from "./es/can-debug";

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	debug();
}
//!steal-remove-end
