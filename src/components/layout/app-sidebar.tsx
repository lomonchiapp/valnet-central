import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import logo from '/valdesk-logo.png'
import icon from '/images/icon.png'
import { useState, useEffect } from 'react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [collapsed, setCollapsed] = useState(false);

  // Track sidebar collapse state
  useEffect(() => {
    const handleSidebarChange = () => {
      // Check if sidebar has the data-collapsed="true" attribute
      const sidebarElement = document.querySelector('[data-collapsed]');
      if (sidebarElement) {
        const isCollapsed = sidebarElement.getAttribute('data-collapsed') === 'true';
        setCollapsed(isCollapsed);
      }
    };

    // Initial check
    handleSidebarChange();

    // Set up a MutationObserver to watch for changes to the data-collapsed attribute
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[data-collapsed]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['data-collapsed']
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        {collapsed ? (
          <img src={icon} alt="icon" className='w-10 h-10 mx-auto' />
        ) : (
          <img src={logo} alt="logo" className='w-48 h-auto pl-4' />
        )}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
