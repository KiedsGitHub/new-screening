dmx.Attribute('bs-tooltip', 'mounted', function(node, attr) {
  let tooltip = bootstrap.Tooltip.getInstance(node);

  this.$watch(attr.value, function(value) {
    node.setAttribute('data-bs-title', value || '');
  });

  if (!tooltip) {
    tooltip = new bootstrap.Tooltip(node, {
      placement: () => node.getAttribute('data-bs-placement') || 'auto',
      title: () => node.getAttribute('data-bs-title') || '',
    });
  }

  return () => {
    if (tooltip) {
      tooltip.dispose();
    }
  };
});
