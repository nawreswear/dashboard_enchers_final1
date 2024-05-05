import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  public links: any = [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'overview',
          icon: 'fa-solid fa-house',
        }
      ],
    },

    {
      title: 'Pages',
      items: [
        {
          name: 'users',
          icon: 'fa-solid fa-users-cog' 
        }, {
          name: 'enchers',
          icon: 'fa-solid fa-bag-shopping',
        },
        {
          name: 'categorie',
          icon: 'fa-solid fa-dumpster-fire',
        },
        {
          name: 'article',
          icon: 'fas fa-box',
        },
        {
          name: 'demande-vendeur',
          icon: 'fa-solid fa-file-alt' 
        },
        {
          name: 'paiment',
          icon: 'fa-solid fa-credit-card',
        },
        {
          name: 'parten',
          icon: 'fa-solid fa-handshake',
        },
        {
          name: 'commentaires',
          icon: 'fa-solid fa-comment',
        },
       /*{
          name: 'tags',
          icon: 'fa-solid fa-tag'
        },
        {
          name: 'tags',
          icon: 'fa-solid fa-wallet' 
        },
        {
          name: 'tags',
          icon: 'fa-solid fa-coins' 
        },
        {
          name: 'tags',
          icon: 'fa-solid fa-users-cog' 
        }
        ,
        {
          name: 'tags',
          icon: 'fa-solid fa-shopping-bag' 
        }
        ,
        {
          name: 'tags',
          icon: 'fa-solid fa-cube' 
        }
        ,
        {
          name: 'tags',
          icon: 'fa-solid fa-gift' 
        }
        ,
        {
          name: 'tags',
          icon: 'fa-solid fa-cogs' 
        }
        ,*/
        {
          name: 'signalisation',
          icon: 'fas fa-exclamation-triangle' 
        }

        /*,
        {
          name: 'livraison',
          icon: 'fa-solid fa-shopping-cart' 
        }
        ,
        {
          name: 'livraison',
          icon: 'fa-solid fa-archive' 
        }
        ,
        {
          name: 'livraison',
          icon: 'fa-solid fa-file-alt' 
        }
        ,
        {
          name: 'livraison',
        //  icon: 'fa-solid fa-envelope',  icon: 'fa-solid fa-comment-dollar' 
       // icon: 'fa-solid fa-bullhorn' 
      // icon: 'fa-solid fa-comments-dollar'
      icon: 'fa-solid fa-user-tie'
        }*/
      
      ],
    },

  ];

  //date formateur  
  public formatReadableDate(dateString: any) {
    const options: any = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    const date = new Date(dateString);

    return date.toLocaleString('en-US', options);
  }


  //price formatteur
  public formatPrice(price: any) {
    if (typeof price === 'string') {

      if (price.includes('$')) {

        return price.replace('$', '') + '$';
      } else {

        return price + '$';
      }
    } else if (typeof price === 'number') {

      return price.toString() + '$';
    } else {

      return 'N/A';
    }
  }

// [routerLink]="['/', item.name]
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
  
  constructor(
    private router: Router
  ) {
    this.router.events.subscribe((event) => {

      if (event instanceof NavigationEnd) {

        this.currentPath = event.url.slice(1);

      }
    });
  }

  public sidebarisOpen: boolean = true;

  public toggleSideBar() {

    this.sidebarisOpen = false;
    console.log(this.sidebarisOpen);

  }

}