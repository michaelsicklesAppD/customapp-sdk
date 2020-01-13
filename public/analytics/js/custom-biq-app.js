class CustomComponent extends BaseComponent {
    constructor(options) {
      options.hasChart = false;
      if (!options.template) {
        options.template = '#_exampleComponent';
      }
      super(options, null);
    }

  }