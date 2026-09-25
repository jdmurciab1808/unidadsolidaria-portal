// Redirecciones automáticas
let currentLocation = window.location.href;

if (currentLocation == "https://www.uaeos.gov.co/") {
  window.location.replace("https://www.unidadsolidaria.gov.co/");
}

if (currentLocation.includes('/es/')) {
  currentLocation = currentLocation.replace('/es', '/');
  window.location = currentLocation;
}

(function ($) {
  Drupal.behaviors.myBehaviour = {
    attach: function (context, settings) {

      let ctrlPressed = false;
      let teclaCtrl = 18, teclaC = 97;

      // Estado del switch de contraste
      if ($("#edit-switch").prop('checked') == true) {
        $("#contrast").addClass('unchecked');
        $("#contrast").removeClass('checked');
      } else {
        $("#contrast").addClass('checked');
        $("#contrast").removeClass('unchecked');
      }

      $(".step").click(function () {
        // Ocultar todas las secciones
        $(".ocultar").hide();
        
        // Mostrar la sección correspondiente
        $("." + $(this).attr("data-id")).show();
        
        // Remover clase active1 de todos los steps
        $('.step').removeClass('active1');
        
        // Agregar clase active1 al step clickeado
        $(this).addClass('active1');
      });

      // Botones de contraste
      $(".checked").click(function () {
        $("#edit-switch").prop('checked', true);
        $("#edit-submit").trigger("click");
      });

      $(".unchecked").click(function () {
        $("#edit-switch").prop('checked', false);
        $("#edit-submit").trigger("click");
      });

      // Idiomas
      $('a[title="Spanish"]').hide();
      $('a[title="English"]').click(function () {
        $(this).hide();
        $('a[title="Spanish"]').show();
      });

      $('a[title="Spanish"]').click(function () {
        $(this).hide();
        $('a[title="English"]').show();
      });

      // Aumentar / reducir la letra: ver js/font-size.js

      // Menú desplegable
      $('.expanded > .dropdown-menu > .expanded').hover(
        function () {
          $(this).addClass('open');
        },
        function () {
          $(this).removeClass('open');
        }
      );

      // Acceso rápido con Ctrl + C o Ctrl + 1
      $(document).keydown(function (e) {
        if (e.keyCode == teclaCtrl)
          ctrlPressed = true;

        if (ctrlPressed && (e.keyCode == teclaC || e.keyCode == 49))
          window.location.href = "http://192.168.1.109/orgsolidarias/";
      });

      $(document).keyup(function (e) {
        if (e.keyCode == teclaCtrl) ctrlPressed = false;
      });

      // Botón "volver arriba"
      $(window).scroll(function () {
        if ($(window).scrollTop() > 300) {
          $('.container-back-to-top-custom').addClass('show-scroll');
        } else {
          $('.container-back-to-top-custom').removeClass('show-scroll');
        }
      });

      $('.container-back-to-top-custom').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 1000);
      });

      const faqItems = document.querySelectorAll(".faq-item");

      faqItems.forEach(item => {
        const btn = item.querySelector(".faq-question");

        if (!btn) return; // seguridad

        btn.addEventListener("click", () => {
          // Cerrar otros items
          faqItems.forEach(i => {
            if (i !== item) {
              i.classList.remove("active");
              const otherIcon = i.querySelector(".icon");
              if (otherIcon) otherIcon.textContent = "+";
            }
          });

          // Alternar actual
          item.classList.toggle("active");

          const icon = item.querySelector(".icon");
          if (icon) icon.textContent = item.classList.contains("active") ? "-" : "+";
        });
      });
    }
  };

  // Cargar script de LiveChat
  Drupal.behaviors.liveChat = {
    attach: function (context, settings) {
      // Verificar si el script ya fue cargado para evitar duplicados
      if (!document.getElementById('mylivechat-script')) {
        const script = document.createElement('script');
        script.id = 'mylivechat-script';
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://mylivechat.com/chatinline.aspx?hccid=49054954&WidgetStartPos=bottomleft&WidgetPosition=bottomleft';
        
        document.body.appendChild(script);
      }
    }
  };

  
})(jQuery);