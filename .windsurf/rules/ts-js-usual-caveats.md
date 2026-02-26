---
trigger: manual
---

### forEach should not return a value:

incorrect:
this.eventHandlers.get(event).forEach(handler => handler(data));

correct:
this.eventHandlers.get(event).forEach(handler => {
  handler(data);
});

### parseInt should have radix

incorrect:
parseInt(this.playerCountSelect.value);

correct:
parseInt(this.playerCountSelect.value, 10);