import test from 'node:test';
import assert from 'node:assert/strict';
import {contactRetryable} from '../src/core/contact-state.js';
test('contact retry is limited to valid tickets with a definitely failed delivery',()=>{
 const id='a'.repeat(32);
 for(const delivery of ['failed','unconfigured','invalid_destination'])assert.equal(contactRetryable({id,delivery}),true);
 for(const delivery of ['delivered','unknown','retrying','pending',undefined,'arbitrary'])assert.equal(contactRetryable({id,delivery}),false);
 for(const bad of ['',null,'not-a-ticket','../contact','A'.repeat(32)])assert.equal(contactRetryable({id:bad,delivery:'failed'}),false);
 assert.equal(contactRetryable(null),false);
 assert.equal(contactRetryable({id,delivery:'failed',retryable:false}),false);
});
