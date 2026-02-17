"use client";

import { useEffect, useRef, useState } from "react";
import { StyleClass } from "primereact/styleclass";
import { Ripple } from "primereact/ripple";
import { Dialog } from "primereact/dialog";
import { ParametrageService } from "@/demo/service/ParametrageService";
import { Button } from "primereact/button";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null); // notif sélectionnée
  const [dialogVisible, setDialogVisible] = useState(false); // état du Dialog

  const btnRef1 = useRef(null);

  // Récupération des notifications
  const fetchNotifications = async () => {
    ParametrageService.getNotifications().then((response) => {
      setNotifications(response);
    });
  };

  // Polling toutes les 10s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Afficher le dialog quand on clique sur une notif
  const handleClickNotif = (notif: any) => {
    setSelectedNotif(notif);
    setDialogVisible(true);
  };

    const editProduct = async (id) => {
          const response = await ParametrageService.notifRead(id);
          setDialogVisible(false);
          window.location.replace('/scolarite/vignettes-coupons');
    };


  return (
    <>
      <li className="static sm:relative">
        <StyleClass
          nodeRef={btnRef1}
          selector="@next"
          enterClassName="hidden"
          enterActiveClassName="scalein"
          leaveToClassName="hidden"
          leaveActiveClassName="fadeout"
          hideOnOutsideClick
        >
          <a tabIndex={0} ref={btnRef1}>
            <i className="pi pi-bell"></i>
            {notifications.length > 0 && (
              <span className="topbar-badge">{notifications.length}</span>
            )}
          </a>
        </StyleClass>

        <ul className="list-none p-3 m-0 border-round shadow-2 absolute surface-overlay hidden origin-top w-full sm:w-19rem mt-2 right-0 z-5 top-auto">
          <li>
            {notifications.length === 0 ? (
              <span className="p-2 bg-red-200 text-sm text-black-500">
                Aucune notification
              </span>
            ) : (
              notifications.map((notif) => (
                <a
                  key={notif.id}
                  className="bg-green-200 p-ripple flex p-1 border-round align-items-center hover:surface-hover transition-colors transition-duration-150 cursor-pointer"
                  onClick={() => handleClickNotif(notif)}
                >
                    <span className="flex flex-col">
                    1 Nouveau Message
                    </span>

                  <Ripple />
                </a>
              ))
            )}
          </li>
        </ul>
      </li>

      {/* Dialog PrimeReact */}
      <Dialog
        header="Message"
        visible={dialogVisible}
        style={{ width: "70vw" }}
        modal
        onHide={() => editProduct(selectedNotif.id)}
      >
        <p className="text-black-600">{selectedNotif?.message}</p>
        <p className="text-red-500">Veuillez immédiatement accéder au menu Vignettes et Coupons, faire les recherches, ouvrir le scan déposé, puis mettre à jour les attributs.</p>
                        <div className="flex justify-center">
                        <Button
                            icon="pi pi-check"
                            label="Compris"
                            rounded
                            severity="success"
                            className="mr-1"
                            onClick={() => editProduct(selectedNotif.id)}
                        />
                        </div>

      </Dialog>
    </>
  );
}