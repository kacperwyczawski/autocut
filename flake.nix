{
  description = "AutoCut";
  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable"; };
  outputs = { nixpkgs, ... }:
    let system = "x86_64-linux";
    in {
      formatter."${system}" = nixpkgs.legacyPackages.${system}.nixfmt;
      devShells."${system}".default =
        let pkgs = nixpkgs.legacyPackages.${system};
        in pkgs.mkShell {
          packages = with pkgs; [ bun biome nushell ];
          shellHook = ''
            exec nu -e 'bun dev'
          '';
        };
    };
}
