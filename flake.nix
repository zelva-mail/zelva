{
  description = "Development environment for Zelva, a JMAP-native email client";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in {
      devShells = forAllSystems (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in {
          default = pkgs.mkShell {
            packages = with pkgs; [
              # Documentation tooling
              nodejs

              # Repository tooling
              git
              gh
              direnv
              nix-direnv
              bashInteractive
            ];

            shellHook = ''
              echo "zelva development shell"
              echo "node: $(node --version)"
            '';
          };
        });

      formatter = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in pkgs.nixpkgs-fmt);
    };
}
