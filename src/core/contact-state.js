// Match the backend's safe retry states. Unknown/in-flight deliveries are
// deliberately excluded: a Discord POST may already have succeeded.
export function contactRetryable(contact){
 return contact?.retryable!==false&&/^[a-f0-9]{32}$/.test(contact?.id||'')&&['failed','unconfigured','invalid_destination'].includes(contact?.delivery);
}
