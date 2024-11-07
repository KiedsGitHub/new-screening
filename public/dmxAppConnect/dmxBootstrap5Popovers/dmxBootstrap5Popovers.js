dmx.Attribute('bs-popover', 'mounted', function(node, attr) {
  let popover = bootstrap.Popover.getInstance(node);

  this.$watch(attr.value, function(value) {
    node.setAttribute('data-bs-content', value || '');
  });

  if (!popover) {
    popover = new bootstrap.Popover(node, {
      placement: () => node.getAttribute('data-bs-placement') || 'auto',
      title: () => node.getAttribute('popover-title') || node.getAttribute('data-bs-title') || '',
      content: () => node.getAttribute('data-bs-content') || '',
    });
  }

  return () => {
    if (popover) {
      popover.dispose();
    }
  };
});
