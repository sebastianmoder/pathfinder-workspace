"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Link from "next/link";
import SignpostIcon from "@mui/icons-material/Signpost";

const navlinks = [
  { title: "Home", path: "/", target: "_self" },
  { title: "SAGE", path: "https://sage.ai-pathfinder.eu", target: "_blank" },
  { title: "GUARD", path: "https://guard.ai-pathfinder.eu", target: "_blank" },
  { title: "ARTISAN", path: "/artisan", target: "_self" },
  { title: "About Us", path: "/about", target: "_self" },
];

function ResponsiveAppBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleOpenNavMenu = () => {
    setMobileOpen(true);
  };

  const handleCloseNavMenu = () => {
    setMobileOpen(false);
  };

  const isActivePath = (path: string, target: string) => {
    if (target !== "_self") {
      return false;
    }
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <AppBar
      className="fixed top-0 border-b border-white/15 bg-eu-blue/90 shadow-lg backdrop-blur-md"
      elevation={0}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          className="min-h-[72px]">
          <SignpostIcon sx={{ display: "flex", mr: 1, color: "#ffd617" }} />
          <Typography
            variant="h5"
            component={Link}
            href="/"
            className="font-mono text-xl font-bold tracking-wider text-white no-underline transition-opacity hover:opacity-90">
            PATHFINDER
          </Typography>

          <Box className="hidden flex-1 items-center justify-end gap-2 md:flex">
            {navlinks.map(({ title, path, target }) => {
              const isActive = isActivePath(path, target);
              return (
                <Link
                  key={title}
                  href={path}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-eu-blue shadow-sm"
                      : "text-gray-100 hover:bg-white/15 hover:text-white"
                  }`}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}>
                  {title}
                </Link>
              );
            })}
          </Box>

          <Box className="ml-auto flex md:hidden">
            <IconButton
              size="large"
              aria-label="Open navigation drawer"
              onClick={handleOpenNavMenu}
              color="inherit"
              className="rounded-xl border border-white/20 bg-white/10">
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={handleCloseNavMenu}
              sx={{
                "& .MuiDrawer-paper": {
                  width: "84vw",
                  maxWidth: "340px",
                  backgroundColor: "#0a3f86",
                  color: "#ffffff",
                },
              }}
              className="md:hidden">
              <Box className="flex items-center justify-between border-b border-white/20 px-4 py-4">
                <Box className="flex items-center gap-2">
                  <SignpostIcon sx={{ color: "#ffd617" }} />
                  <Typography className="font-mono text-lg font-bold tracking-wider">PATHFINDER</Typography>
                </Box>
                <IconButton
                  aria-label="Close navigation drawer"
                  onClick={handleCloseNavMenu}
                  className="text-white">
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box
                component="nav"
                className="flex flex-col gap-2 p-4">
                {navlinks.map(({ title, path, target }) => {
                  const isActive = isActivePath(path, target);
                  return (
                    <Link
                      key={title}
                      href={path}
                      onClick={handleCloseNavMenu}
                      aria-current={isActive ? "page" : undefined}
                      className={`rounded-xl px-4 py-3 text-base font-semibold no-underline transition-colors ${
                        isActive ? "bg-white text-eu-blue" : "text-white hover:bg-white/15"
                      }`}
                      target={target}
                      rel={target === "_blank" ? "noopener noreferrer" : undefined}>
                      {title}
                    </Link>
                  );
                })}
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
