
import { Application } from './application';

window.addEventListener('load', function(){

    preact.render(
        <Application />,
        document.getElementById('application')
    );
});
