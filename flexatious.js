export function $ (query) { return [...document.querySelectorAll(query)] };

setInterval(() => {
   $('grid').map((element) => {
      const template = [];
      for (let child of [...element.children])
         template.push(child.getAttribute('size') || '1fr');
      const property = `grid-template-${element.getAttribute('type')}`;
      if (property === 'grid-template-null') return false;
      if (!template.length) element.removeAttribute('style');
      else element.setAttribute('style', `${property}: ${template.join(' ')}`);
   });
});